import * as process from 'node:process';
import type { Storage } from '@google-cloud/storage';
import { loadConfig } from './config';
import { getStorageClient } from './gcloud';
import { InvokeEvent } from './models';
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

export const handler = async (eventRaw: unknown) => {
	console.log(`Incoming data: ${JSON.stringify(eventRaw)}`);

	//delay until we have cached the credentials. The lambda timeout will prevent us looping forever.
	while (!storage) {
		console.log(`Credentials have not yet been loaded, waiting...`);
		await asyncDelay(100);
	}

	const event = InvokeEvent.parse(eventRaw); //Let It Crash (TM)
	const pathToScan = breakDownUrl(event.gcs_blob);
	const files = await findMatchingFiles(storage, pathToScan);
	console.log(`Got ${files.length} files`);

	for (const f of files) {
		const rows = await retrieveContent(f);
		console.log(
			`${f.name} gave us ${rows.length} rows: ${JSON.stringify(rows)}`,
		);
	}
};
