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

//const storage = new Storage(); //FIXME: load in credentials properly

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
		console.log(`${f.name} gave us ${rows.length} rows:`);
		for (const r of rows) {
			console.log(`  ${JSON.stringify(r)}`);
		}
	}
	// const incomingData = await retrieveContent(event.gcpBucket, event.filePath);
	// console.log(`Incoming data: ${JSON.stringify(incomingData)}`);
};

// //temporary debugging for local run
// retrieveContent('some-bucket-name', 'some-file-path')
// 	.then(() => console.info('done'))
// 	.catch((err) => {
// 		if (err instanceof Error) {
// 			console.error(`Unable to run: ${err.message}`);
// 			console.error(err.stack);
// 		} else {
// 			console.error(err);
// 		}
// 	});
