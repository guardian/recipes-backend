import type { Readable } from 'stream';

/**
 * Just consumes the stream to an in-memory buffer.
 * Not very efficient, I admit, but since the data is small i couldn't be bothered
 * with full ndjson streaming
 * @param readable
 */
export async function consumeReadable(readable: Readable): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		let mainBuffer: Buffer = Buffer.alloc(0);

		readable.on('readable', () => {
			let chunk: Buffer | null;
			// Use a loop to make sure we read all currently available data
			while (null !== (chunk = readable.read() as Buffer | null)) {
				mainBuffer = Buffer.concat([mainBuffer, chunk]);
			}
		});

		readable.on('end', () => {
			resolve(mainBuffer);
		});

		readable.on('error', (err) => {
			reject(err);
		});
	});
}
