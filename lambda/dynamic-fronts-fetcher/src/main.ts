import * as process from 'node:process';
import type { Storage } from '@google-cloud/storage';
import { registerMetric } from '@recipes-api/cwmetrics';
import { loadConfig } from './config';
import { getStorageClient } from './gcloud';
import type { IncomingDataRow } from './models';
import { InvokeEvent } from './models';
import { writeDynamicData } from './s3';
import { convertBQReport } from './transform';
import {
	breakDownUrl,
	findMatchingFiles,
	retrieveContent,
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

	//delay until we have cached the credentials. The lambda timeout will prevent us looping forever.
	while (!storage) {
		console.log(`Credentials have not yet been loaded, waiting...`);
		await asyncDelay(100);
	}

	const event = InvokeEvent.parse(eventRaw); //Let It Crash (TM)
	if (!!event.country_key && !!event.gcs_blob) {
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
