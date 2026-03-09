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

/**
 * Consumes a readable stream and concatenates its chunks into a single buffer.
 * This method is efficient for small data streams and ensures the entire content
 * is read into memory.
 * @param readable - The readable stream to consume.
 * @returns A promise that resolves to a buffer containing the stream's content.
 */
//TODO - this is basically the same as consumeReadable, but more efficient.
// We should probably just have one of these and rename it to something more generic?? Query to resolve with Andy.G

export async function consumeReadable_dataToBuffer(
	readable: Readable,
): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		const chunks: Buffer[] = [];

		readable.on('data', (chunk: Buffer) => {
			chunks.push(chunk);
		});

		readable.on('end', () => {
			resolve(Buffer.concat(chunks));
		});

		readable.on('error', (err) => {
			reject(err);
		});
	});
}
