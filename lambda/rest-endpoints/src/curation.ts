import type { GetObjectOutput } from '@aws-sdk/client-s3';
import {
	GetObjectCommand,
	S3Client,
	S3ServiceException,
} from '@aws-sdk/client-s3';
import type { NodeJsRuntimeStreamingBlobTypes } from '@smithy/types/dist-types/streaming-payload/streaming-blob-common-types';
import { format as formatDate, subDays } from 'date-fns';
import { FeastAppContainer } from '@recipes-api/lib/facia';
import { consumeReadable } from '@recipes-api/lib/recipes-data';

const s3Client = new S3Client({
	region: process.env['AWS_REGION'] ?? 'eu-west-1',
});

async function rawCurationDataForToday(
	region: string,
	variant: string,
): Promise<GetObjectOutput> {
	try {
		return await s3Client.send(
			new GetObjectCommand({
				Bucket: process.env['STATIC_BUCKET'],
				Key: `${region}/${variant}/curation.json`,
			}),
		);
	} catch (err) {
		if (err instanceof S3ServiceException) {
			if (err.name == 'NotFound') {
				const today = formatDate(new Date(), 'yyyy-MM-dd');

				return await s3Client.send(
					new GetObjectCommand({
						Bucket: process.env['STATIC_BUCKET'],
						Key: `${region}/${variant}/${today}/curation.json`,
					}),
				);
			} else {
				console.error(`Unexpected S3 exception ${err.name}: `, err);
				throw err;
			}
		} else {
			console.error(`Unexpected exception `, err);
			throw err;
		}
	}
}

export async function retrieveTodaysCuration(
	region: string,
	variant: string,
): Promise<FeastAppContainer[]> {
	const s3response = await rawCurationDataForToday(region, variant);
	if (s3response.Body) {
		const rawData = await consumeReadable(
			s3response.Body as NodeJsRuntimeStreamingBlobTypes,
		);

		const rawJson = JSON.parse(rawData.toString()) as unknown;
		if (rawJson instanceof Array) {
			const data = (rawJson as unknown[]).map((d) =>
				FeastAppContainer.parse(d),
			);
			return data;
		} else {
			console.error(
				`Curation for ${region}/${variant} was not valid, no array at the root`,
			);
			throw new Error('Invalid curation data');
		}
	} else {
		console.error(
			`S3 object existed for ${region}/${variant} but no data recieved`,
		);
		throw new Error('No data received');
	}
}

/**
 * Gets the insert data (if any) for the given territory
 * @param territory two-letter territory code
 * @param date date to retrieve for
 * @returns the FeastAppContainer if present or `undefined` if not. Errors are raised through exceptions.
 */
export async function retrieveLocalisationInsert(
	territory: string,
	date: Date,
): Promise<FeastAppContainer | undefined> {
	const today = formatDate(date, 'yyyy-MM-dd');

	try {
		const s3response = await s3Client.send(
			new GetObjectCommand({
				Bucket: process.env['STATIC_BUCKET'],
				Key: `dynamic/curation/${today}/${territory.toUpperCase()}.json`,
			}),
		);
		const rawData = await consumeReadable(
			s3response.Body as NodeJsRuntimeStreamingBlobTypes,
		);
		const rawJson = JSON.parse(rawData.toString()) as unknown;
		return FeastAppContainer.parse(rawJson);
	} catch (err) {
		if (err instanceof S3ServiceException) {
			if (err.name == 'NotFound') {
				console.info(
					`No localisation found for ${territory} on ${date.toISOString()}`,
				);
				return undefined;
			} else {
				throw err;
			}
		} else {
			throw err;
		}
	}
}

export async function findRecentLocalisation(
	territory: string,
	cutoffInDays: number,
) {
	const startDate = new Date();

	for (let i = 0; i < cutoffInDays; i++) {
		const testDate = subDays(startDate, i);

		const maybeLocalisation = await retrieveLocalisationInsert(
			territory,
			testDate,
		);
		if (maybeLocalisation) {
			return maybeLocalisation;
		}
	}
	return undefined;
}

export async function generateHybridFront(
	region: string,
	variant: string,
	territory: string | undefined,
	localisationInsertionPoint: number,
): Promise<FeastAppContainer[]> {
	const curatedFront = await retrieveTodaysCuration(region, variant);
	if (variant == 'meat-free') {
		//we don't currently support localisation for meat-free
		return curatedFront;
	}

	if (!territory) {
		//no territory given so we can't localise
		return curatedFront;
	}
	const maybeLocalisation = await findRecentLocalisation(territory, 5);
	if (maybeLocalisation) {
		if (curatedFront.length > localisationInsertionPoint) {
			curatedFront.push(maybeLocalisation);
			return curatedFront;
		} else {
			return curatedFront
				.slice(0, localisationInsertionPoint)
				.concat(
					maybeLocalisation,
					...curatedFront.slice(localisationInsertionPoint),
				);
		}
	} else {
		console.info(
			`No localisation available for ${region} / ${variant} in ${territory}`,
		);
		return curatedFront;
	}
}
