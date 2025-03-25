import type { File, Storage } from '@google-cloud/storage';

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
