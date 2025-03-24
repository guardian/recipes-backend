import * as process from 'node:process';
import { Storage } from '@google-cloud/storage';
import { loadConfig } from './config';
import { consumeReadable } from './consume-readable';
import { getStorageClient } from './gcloud';
import { IncomingDataRow, InvokeEvent } from './models';
import { breakDownUrl, findMatchingFiles } from './url-handling';

function asyncDelay(timeout: number): Promise<void> {
	return new Promise<void>((resolve) => setTimeout(resolve, timeout));
}

async function retrieveContent(
	gcpBucket: string,
	filePath: string,
): Promise<IncomingDataRow[]> {
	const storage = new Storage(); //just using app default; will probably need proper creds here
	const b = storage.bucket(gcpBucket);
	const f = b.file(filePath);

	const content = await consumeReadable(f.createReadStream());
	const objects = content.toString('utf-8').split('\n');

	return objects
		.map((str, ctr) => {
			try {
				return JSON.parse(str) as unknown;
			} catch (err) {
				console.warn(
					`Unparseable content at line ${ctr} of ${gcpBucket}:${filePath} - '${str}'`,
				);
				return undefined;
			}
		})
		.map((obj, ctr) => {
			if (!obj) return undefined;
			const result = IncomingDataRow.safeParse(obj);
			if (result.success) {
				return result.data;
			} else {
				console.warn(
					`Data from line ${ctr} did not marshal: ${result.error.toString()}. Content was '${JSON.stringify(
						obj,
					)}'.`,
				);
				return undefined;
			}
		})
		.filter((obj) => !!obj) as IncomingDataRow[];
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
