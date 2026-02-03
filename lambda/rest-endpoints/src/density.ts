import {
	CopyObjectCommand,
	GetObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { parse } from 'csv-parse/sync';
import { parseISO } from 'date-fns';
import type { DensityJson } from '@recipes-api/lib/feast-models';
import { DensityJsonSchema } from '@recipes-api/lib/feast-models';
import {
	getContentPrefix,
	sendFastlyPurgeRequestWithRetries,
} from '@recipes-api/lib/recipes-data';
import { FastlyApiKey, StaticBucketName } from './config';

const s3Client = new S3Client({ region: process.env['AWS_REGION'] });

const S3_BASE_PATH = 'densities';
const S3_LIVE_PATH = 'densities/latest/densities.json';

class DensityEntry {
	id: number;
	name: string;
	normalised_name: string;
	density: number;
	source: string;

	constructor(row?: string[]) {
		if (!row) {
			this.id = 0;
			this.name = '';
			this.normalised_name = '';
			this.density = 0.0;
			this.source = '';
			return;
		}

		if (row.length < 4) {
			throw new Error('row did not have enough entries, expected at least 4');
		}

		if (row.length > 5) {
			console.warn(
				'got more rows than expected on input data, extras will be ignored',
			);
		}

		this.id = Number.parseInt(row[0], 10);
		this.name = row[1];
		this.normalised_name = row[2];
		this.density = Number.parseFloat(row[3]);
		this.source = '';
		if (isNaN(this.density))
			throw new Error(
				'row was not in the right format, density was not a number',
			);
	}
}

export function parseDensityCSV(csvText: string, continueOnIncomplete = false) {
	const records: string[][] = parse(csvText, {
		relax_column_count: true,
		trim: true,
	});

	let entries = records.map((row, idx) => {
		try {
			return new DensityEntry(row);
		} catch (e) {
			if (idx === 0) {
				console.info(`Skipping possible header row ${JSON.stringify(row)}`);
				return;
			}
			console.warn(`Could not parse row ${idx}: ${(e as Error).message}`);
			return undefined;
		}
	});
	if (entries[0] === undefined) {
		entries = entries.slice(1);
	}

	if (entries.length == 0) {
		throw new Error(`There was no data to import`);
	}
	const failureCount = entries.filter((e) => e == undefined).length;
	if (!continueOnIncomplete && failureCount > 0) {
		throw new Error(`${failureCount} rows did not convert`);
	}
	return entries.filter((e) => !!e) as DensityEntry[];
}

export function transformDensityData(entries: DensityEntry[]): DensityJson {
	return {
		prepared_at: new Date(),
		key: ['id', 'name', 'normalised_name', 'density'],
		values: entries.map((e) => [e.id, e.name, e.normalised_name, e.density]),
	};
}

function makeS3Path<T extends { prepared_at: Date }>(content: T) {
	return (
		S3_BASE_PATH + '/' + content.prepared_at.toISOString() + '/densities.json'
	);
}

function latestS3Path() {
	return S3_BASE_PATH + '/latest/densities.json';
}

export async function publishDensityData(content: DensityJson) {
	const Key = makeS3Path(content);

	console.log(`Publishing density data to ${Key}...`);
	await s3Client.send(
		new PutObjectCommand({
			Bucket: StaticBucketName,
			Key,
			Body: JSON.stringify(content),
		}),
	);

	console.log(`Flushing CDN...`);
	await sendFastlyPurgeRequestWithRetries({
		contentPath: Key,
		apiKey: FastlyApiKey,
		contentPrefix: getContentPrefix(),
		retryCount: 3,
	});
}

export async function activateDensityData(content: DensityJson) {
	const CopySource = StaticBucketName + '/' + makeS3Path(content);

	console.log(
		`Activating density data from ${CopySource} in ${StaticBucketName} as the current version...`,
	);
	await s3Client.send(
		new CopyObjectCommand({
			Bucket: StaticBucketName,
			CopySource,
			Key: S3_LIVE_PATH,
		}),
	);
	console.log(`Flushing CDN...`);
	await sendFastlyPurgeRequestWithRetries({
		contentPath: S3_LIVE_PATH,
		apiKey: FastlyApiKey,
		contentPrefix: getContentPrefix(),
		retryCount: 3,
	});
}

export async function getExistingDensityData(Key: string) {
	const existingObject = await s3Client.send(
		new GetObjectCommand({
			Bucket: StaticBucketName,
			Key,
		}),
	);
	const existingContent = await existingObject.Body?.transformToString('utf-8');
	console.log(`Obtained data at ${Key}, verifying...`);
	return existingContent
		? DensityJsonSchema.parse(JSON.parse(existingContent))
		: undefined;
}

export async function rollBackDensityData(prepared_at: Date) {
	console.log(
		`Attempting to roll back density data to ${prepared_at.toISOString()}...`,
	);
	console.log('Verifying existing data...');
	//First, let's verify that the content actually exists and is valid
	const Key = makeS3Path({ prepared_at });

	try {
		//This will throw if the data is not valid

		const existing = await getExistingDensityData(Key);
		if (!existing) {
			console.error(`No data existed at ${Key}`);
			throw new Error(
				`Unable to get content for date ${prepared_at.toISOString()}`,
			);
		}

		//OK, the data is valid, we can proceed
		console.log(`Data is valid, rolling back`);
		await s3Client.send(
			new CopyObjectCommand({
				Bucket: StaticBucketName,
				CopySource: Key,
				Key: S3_LIVE_PATH,
			}),
		);

		console.log(`Rollback complete, flushing CDN`);
		await sendFastlyPurgeRequestWithRetries({
			contentPath: S3_LIVE_PATH,
			apiKey: FastlyApiKey,
			contentPrefix: getContentPrefix(),
			retryCount: 3,
			purgeType: 'hard',
		});
	} catch (err) {
		console.warn(
			`Can't roll back to density data from ${prepared_at.toISOString()} because the content is not valid. Error was: ${String(err)}`,
		);
		throw new Error(`The density data from that date is not valid`);
	}
}

const path_xtractor = /densities\/([\w:.-]+)\/densities.json/;

function extract_density_path(key: string) {
	const parts = path_xtractor.exec(key);
	if (parts && parts[1] != 'latest') {
		try {
			return parseISO(parts[1]);
		} catch (err) {
			console.warn(
				`Unexpected file path ${key} in density tree: ${String(err)}`,
			);
		}
	}
}

export async function listDensityDataRevisions(
	MaxKeys?: number,
	ContinuationToken?: string,
) {
	const response = await s3Client.send(
		new ListObjectsV2Command({
			Bucket: StaticBucketName,
			Prefix: S3_BASE_PATH,
			MaxKeys,
			ContinuationToken,
		}),
	);

	const keys = (response.Contents?.map((obj) => obj.Key).filter((k) => !!k) ??
		[]) as string[];

	const options = keys.map(extract_density_path).filter((v) => !!v) as Date[];

	try {
		const currentData = await getExistingDensityData(latestS3Path());

		return {
			current: currentData?.prepared_at ?? 'NOT_PRESENT',
			options,
			continuation: response.NextContinuationToken,
		};
	} catch (err) {
		console.warn(String(err));
		return {
			options,
			continuation: response.NextContinuationToken,
			warning: 'Current data is not valid!',
		};
	}
}
