import { Storage } from '@google-cloud/storage';
import { consumeReadable } from './consume-readable';
import { IncomingDataRow, InvokeEvent } from './models';

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

export const handler = async (eventRaw: unknown) => {
	console.log(`Incoming data: ${JSON.stringify(eventRaw)}`);
	return new Promise<void>((resolve) => setTimeout(resolve, 1000));
	// const event = InvokeEvent.parse(eventRaw); //Let It Crash (TM)
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
