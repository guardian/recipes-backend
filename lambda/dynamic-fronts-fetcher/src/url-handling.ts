import type { File, Storage } from '@google-cloud/storage';
import { consumeReadable } from '@recipes-api/lib/recipes-data';
import { IncomingDataRow, IncomingPersonalisedRow } from './models';

export function breakDownUrl(from: string): {
	gcpBucket: string;
	prefix: string;
} {
	const parts: RegExpExecArray | null = /gs:\/\/([^/]+)\/([^*]+)\*/.exec(from);
	if (!parts) throw new Error(`Unable to parse google storage url ${from}`);
	return {
		gcpBucket: parts[1],
		prefix: parts[2],
	};
}

export async function findMatchingFiles(
	storage: Storage,
	{ gcpBucket, prefix }: { gcpBucket: string; prefix: string },
): Promise<File[]> {
	const [files] = await storage.bucket(gcpBucket).getFiles({
		prefix,
	});

	console.debug(
		`Querying for files under ${prefix} on ${gcpBucket} found ${files.length} results:`,
	);
	files.forEach((f) => console.debug(`  ${f.name}`));
	return files;
}

const IsEmpty = /^\s*$/;

export async function retrieveContent(file: File): Promise<IncomingDataRow[]> {
	const content = await consumeReadable(file.createReadStream());
	console.log(`debug: ${file.name} contents:`);
	const objects = content.toString('utf-8').split('\n');
	for (const line of objects) {
		console.log(`  ${line}`);
	}

	return objects
		.map((str, ctr) => {
			try {
				if (IsEmpty.test(str)) return undefined;
				return JSON.parse(str) as unknown;
			} catch (err) {
				console.warn(
					`Unparseable content at line ${ctr} of ${file.bucket.name}:${file.name} - '${str}'`,
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
		.filter((obj) => !!obj);
}

export async function retrievePersonalisedContent(
	file: File,
): Promise<IncomingPersonalisedRow[]> {
	const content = await consumeReadable(file.createReadStream());
	const objects = content.toString('utf-8').split('\n');

	return objects
		.map((str, ctr) => {
			try {
				if (IsEmpty.test(str)) return undefined;
				const parsed = JSON.parse(str) as {
					identity_id: string;
					total_available: number;
					items: Array<{ id: string }>;
				};
				const identityId: string = parsed.identity_id;
				const totalAvailable: number = parsed.total_available;
				const items: string[] = parsed.items.map((item) => item.id);

				const parsedRow: {
					identity_id: string;
					items: string[];
					total_available: number;
				} = {
					identity_id: identityId,
					items,
					total_available: totalAvailable,
				};
				const result = IncomingPersonalisedRow.safeParse(parsedRow);
				if (result.success) {
					return result.data;
				} else {
					console.warn(
						`Data from line ${ctr} did not marshal: ${result.error.toString()}. Content was '${JSON.stringify(
							parsedRow,
						)}'.`,
					);
					return undefined;
				}
			} catch (err) {
				console.warn(
					`Unparseable content at line ${ctr} of ${file.bucket.name}:${file.name} - '${str}', error was ${err}`,
				);
				return undefined;
			}
		})
		.filter((obj) => !!obj) as IncomingPersonalisedRow[];
}
