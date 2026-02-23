import * as process from 'node:process';
import type { Storage } from '@google-cloud/storage';
import { registerMetric } from '@recipes-api/cwmetrics';
import { loadConfig } from './config';
import { getStorageClient } from './gcloud';
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

export const handler = async (eventRaw: unknown) => {
	console.log(`Incoming data: ${JSON.stringify(eventRaw)}`);

	// Delay until we have cached the credentials. The lambda timeout will prevent us looping forever.
	while (!storage) {
		console.log(`Credentials have not yet been loaded, waiting...`);
		await asyncDelay(100);
	}

	const event = InvokeEvent.parse(eventRaw); // Let It Crash (TM)

	if (event.personalised && !!event.gcs_blob) {
		// Handle personalised.json processing
		const pathToPersonalised = breakDownUrl(event.gcs_blob);
		const personalisedFile = await findMatchingFiles(
			storage,
			pathToPersonalised,
		);
		console.log(`Got - ${personalisedFile.length} file`);

		if (!personalisedFile || personalisedFile.length === 0) {
			console.error(`No content found in personalised.json`);
			await registerMetric('FailedPersonalisedContainer', 1);
			throw new Error('No content found in personalised.json');
		}

		const personalisedData = [
			await retrievePersonalisedContent(personalisedFile[0]),
		];
		const allRows = personalisedData.flat();

		const personalisedContainers = allRows.map((entry: any) =>
			convertPersonalisedBQReport(entry),
		);

		// Batch processing for large number of files
		const batchSize = 1000;
		for (let i = 0; i < personalisedContainers.length; i += batchSize) {
			const batch = personalisedContainers.slice(i, i + batchSize);
			await Promise.all(
				batch.map((entry) => writePersonalisedData(outputBucketName, entry)),
			);
		}

		console.log(
			`Processed ${personalisedContainers.length} personalised files`,
		);
	} else if (!!event.country_key && !!event.gcs_blob) {
		// Existing logic for dynamic fronts
		const pathToScan = breakDownUrl(event.gcs_blob);
		const files = await findMatchingFiles(storage, pathToScan);
		console.log(`Got ${files.length} files`);

		const results = await Promise.all(files.map(retrieveContent));
		const allRows = results.flat();

		const container = convertBQReport(event.country_key, allRows);
		await writeDynamicData(
			outputBucketName,
			new Date(),
			event.country_key,
			container,
		);
		console.log(`Completed`);
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
