import type { Readable } from 'stream';

/**
 * Just consumes the stream to an in-memory buffer.
 * Not very efficient, I admit, but since the data is small i couldn't be bothered
 * with full ndjson streaming
 * @param readable
 */
export async function consumeReadable(readable: Readable): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		let mainBuffer: Buffer = new Buffer(0);

		readable.on('readable', () => {
			let chunk: Buffer | null;
			console.log('Stream is readable (new data received in buffer)');
			// Use a loop to make sure we read all currently available data
			while (null !== (chunk = readable.read() as Buffer | null)) {
				console.log(`Read ${chunk.length} bytes of data...`);
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
