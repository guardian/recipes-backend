import * as process from 'node:process';
import type { Storage } from '@google-cloud/storage';
import { registerMetric } from '@recipes-api/cwmetrics';
import { loadConfig } from './config';
import { getStorageClient } from './gcloud';
import type { IncomingPersonalisedRow } from './models';
import { InvokeEvent } from './models';
import { writeDynamicData, writePersonalisedData } from './s3';
import { convertBQReport, convertPersonalisedBQReport } from './transform';
import {
	breakDownUrl,
	findMatchingFiles,
	retrieveContent,
	retrievePersonalisedContent,
} from './url-handling';

function asyncDelay(timeout: number): Promise<void> {
	return new Promise<void>((resolve) => setTimeout(resolve, timeout));
}

let storage: Storage | null = null;
loadConfig()
	.then((config) => {
		storage = getStorageClient(config);
	})
	.catch((err) => {
		console.error(`Unable to load config: `, err);
		process.exit(1);
	});

const outputBucketName = process.env['BUCKET_NAME'] ?? 'set-bucketname-env-var';

async function handlePersonalised(
	storage: Storage,
	gcsBlob: string,
): Promise<void> {
	const pathToPersonalised = breakDownUrl(gcsBlob);
	const personalisedFile = await findMatchingFiles(storage, pathToPersonalised);

	console.log(`Got - ${personalisedFile.length} file, `);

	const personalisedData = [
		await retrievePersonalisedContent(personalisedFile[0]),
	];

	const allRows = personalisedData.flat();

	const personalisedContainers = allRows.map((entry: IncomingPersonalisedRow) =>
		convertPersonalisedBQReport(entry),
	);

	console.log(
		`Number of personalised containers to write: `,
		personalisedContainers.length,
	);

	// Batch processing for large number of files
	const batchSize = 1000;
	for (let i = 0; i < personalisedContainers.length; i += batchSize) {
		const batch = personalisedContainers.slice(i, i + batchSize);
		if (i % 10000 === 0) {
			//to have less number of logs, we log every 10k entries, will remove this once tested once again end to end.
			console.log(`Processing batch starting at index: ${i}`);
		}
		await Promise.all(
			batch.map((entry) => writePersonalisedData(outputBucketName, entry)),
		);
	}
}

async function handleCountry(
	storage: Storage,
	gcsBlob: string,
	country_key: string,
): Promise<void> {
	const pathToScan = breakDownUrl(gcsBlob);
	const files = await findMatchingFiles(storage, pathToScan);
	console.log(`Got ${files.length} files`);

	const results = await Promise.all(files.map(retrieveContent));
	const allRows = results.flat();

	const container = convertBQReport(country_key, allRows);
	await writeDynamicData(outputBucketName, new Date(), country_key, container);
	console.log(`Completed`);
}

export const handler = async (eventRaw: unknown) => {
	console.log(`Incoming data: ${JSON.stringify(eventRaw)}`);

	// Delay until we have cached the credentials. The lambda timeout will prevent us looping forever.
	while (!storage) {
		console.log(`Credentials have not yet been loaded, waiting...`);
		await asyncDelay(100);
	}

	const event = InvokeEvent.parse(eventRaw); // Let It Crash (TM)

	if ('personalised' in event && !!event.gcs_blob) {
		await handlePersonalised(storage, event.gcs_blob);
	} else if ('country_key' in event && !!event.gcs_blob) {
		await handleCountry(storage, event.gcs_blob, event.country_key);
	} else {
		console.error(
			`Invalid invoke data, missing either country key or GCS path. Got ${JSON.stringify(
				event,
			)}.`,
		);
		await registerMetric('FailedDynamicContainer', 1);
		throw new Error('Invalid invoke data');
	}
};
