import type { Readable } from 'stream';

/**
 * Consumes a readable stream and concatenates its chunks into a single buffer.
 * Collecting chunks in an array and concatenating them is an O(n) operation,
 * compared to repeatedly concatenating buffers, which is O(n²) because Buffer.concat()
 * always copies and doesn't realloc.
 * @param readable - The readable stream to consume.
 */
export async function consumeReadable(readable: Readable): Promise<Buffer> {
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
