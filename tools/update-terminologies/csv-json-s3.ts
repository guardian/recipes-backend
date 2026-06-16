#!/usr/bin/env node
/**
 * terminologies tool — convert a UK/US terminologies CSV to JSON and manage it in S3.
 *
 * CSV input has 3 columns: id, ukTerm, usTerm
 *
 * Produces JSON of the shape:
 *   {
 *     "prepared_at": "2026-06-02T10:30:00Z",
 *     "key": ["id", "ukTerm", "usTerm"],
 *     "values": [[1, "sugar", "sugar"], ...]
 *   }
 *
 * S3 layout (per stage bucket):
 *   terminologies/terminologies-<timestamp>.json   <- dated archives (what `list` shows)
 *   terminologies/latest/terminologies.json        <- live file the library reads
 *
 * Commands:
 *   update   --stage CODE --file ./terms.csv
 *            -> writes a new dated archive AND overwrites the live file
 *   list     --stage CODE
 *            -> lists the dated archives in the terminologies folder
 *   rollback --stage CODE --datetime 2026-06-02T10-30-00
 *            -> copies the matching archive back over the live file
 */

import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { Command } from 'commander';
import {
	S3Client,
	PutObjectCommand,
	ListObjectsV2Command,
	CopyObjectCommand,
} from '@aws-sdk/client-s3';

const stage = process.env['STAGE'] ?? 'CODE';

const bucket = process.env['BUCKET'] ?? 'feast-recipes-static-code';

const region = process.env['REGION'] ?? 'eu-west-1';

const s3 = new S3Client({ region: region });

// Fixed S3 paths.
const ARCHIVE_PREFIX = 'terminologies/'; // dated copies live here
const LIVE_PREFIX = 'terminologies/latest/'; // subfolder for the live file
const LIVE_KEY = 'terminologies/latest/terminologies.json';

// The JSON key array, exactly as the consuming library expects.
const KEYS = ['id', 'ukTerm', 'usTerm'] as const;

function archiveKey(stamp: string): string {
	return `${ARCHIVE_PREFIX}${stamp}/terminologies.json`;
}

// id should be a number; fall back to the raw string if it isn't numeric.
function toId(raw: string): number | string {
	const n = Number(raw);
	return Number.isNaN(n) ? raw : n;
}

// ---------------------------------------------------------------------------
// update: CSV -> JSON, write a dated archive + overwrite the live file
// ---------------------------------------------------------------------------
async function update(stage: string, file: string): Promise<void> {
	const records: Array<Record<string, string>> = parse(readFileSync(file), {
		columns: (header: string[]) => header.map((h) => h.trim()),
		skip_empty_lines: true,
		trim: true,
	});

	const now = new Date();
	const preparedAt = now.toISOString(); // 2026-04-22T15:02:13.338Z
	const stamp = preparedAt; //.replace(/:/g, '-').replace('Z', ''); // 2026-06-02T10-30-00

	const doc = {
		prepared_at: preparedAt,
		key: [...KEYS],
		values: records.map((r) => [toId(r.id), r.ukTerm, r.usTerm]),
	};

	const body = JSON.stringify(doc, null, 2);

	// 1) dated archive (history / rollback source)
	const archive = archiveKey(stamp);
	await s3.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: archive,
			Body: body,
			ContentType: 'application/json',
		}),
	);

	// 2) live file the library reads
	await s3.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: LIVE_KEY,
			Body: body,
			ContentType: 'application/json',
		}),
	);

	console.log(`✓ ${doc.values.length} terms prepared at ${preparedAt}`);
	console.log(`  archive : s3://${bucket}/${archive}`);
	console.log(`  live    : s3://${bucket}/${LIVE_KEY}`);
}

// ---------------------------------------------------------------------------
// Shared helper: fetch the dated archives (excludes the live/ subfolder)
// ---------------------------------------------------------------------------
interface Archive {
	key: string;
	stamp: string;
	lastModified?: Date;
}

async function listArchives(bucket: string): Promise<Archive[]> {
	const out: Archive[] = [];
	let token: string | undefined;

	do {
		const res = await s3.send(
			new ListObjectsV2Command({
				Bucket: bucket,
				Prefix: ARCHIVE_PREFIX,
				ContinuationToken: token,
			}),
		);
		for (const obj of res.Contents ?? []) {
			const key = obj.Key;
			if (!key || !key.endsWith('.json')) continue;
			if (key.startsWith(LIVE_PREFIX)) continue; // skip the live file
			const m = key.match(/terminologies-(.+)\.json$/);
			out.push({ key, stamp: m ? m[1] : key, lastModified: obj.LastModified });
		}
		token = res.IsTruncated ? res.NextContinuationToken : undefined;
	} while (token);

	// Newest first.
	out.sort(
		(a, b) =>
			(b.lastModified?.getTime() ?? 0) - (a.lastModified?.getTime() ?? 0),
	);
	return out;
}

// ---------------------------------------------------------------------------
// list: show the dated archives in the terminologies folder
// ---------------------------------------------------------------------------
async function list(stage: string): Promise<void> {
	const archives = await listArchives(bucket);

	if (archives.length === 0) {
		console.log(
			`(no terminologies archives in s3://${bucket}/${ARCHIVE_PREFIX})`,
		);
		return;
	}

	console.log(`terminologies archives in s3://${bucket}/${ARCHIVE_PREFIX}:`);
	for (const a of archives) {
		console.log(`  ${a.stamp}   (${a.lastModified?.toISOString() ?? '?'})`);
	}
	console.log(
		`\nRoll back with:  rollback --stage ${stage} --datetime <stamp>`,
	);
}

// ---------------------------------------------------------------------------
// rollback: copy a chosen dated archive back over the live file
// ---------------------------------------------------------------------------
async function rollback(stage: string, datetime: string): Promise<void> {
	const archives = await listArchives(bucket);

	// Match archives whose stamp contains the supplied date/time string,
	// so the user can pass a full stamp or a unique prefix like "2026-06-02".
	const matches = archives.filter(
		(a) => a.stamp.includes(datetime) || a.key.includes(datetime),
	);

	if (matches.length === 0) {
		console.error(`No archive matches "${datetime}". Available:`);
		archives.forEach((a) => console.error(`  ${a.stamp}`));
		process.exit(1);
	}
	if (matches.length > 1) {
		console.error(
			`"${datetime}" matches multiple archives — be more specific:`,
		);
		matches.forEach((a) => console.error(`  ${a.stamp}`));
		process.exit(1);
	}

	const target = matches[0];
	await s3.send(
		new CopyObjectCommand({
			Bucket: bucket,
			Key: LIVE_KEY,
			CopySource: `${bucket}/${target.key}`,
			MetadataDirective: 'COPY',
		}),
	);

	console.log(`✓ Rolled back live file to archive ${target.stamp}`);
	console.log(`  ${target.key}  ->  ${LIVE_KEY}`);
}

// ---------------------------------------------------------------------------
// CLI wiring
// ---------------------------------------------------------------------------
const program = new Command();
program
	.name('terminologies')
	.description('UK/US terminologies CSV -> JSON -> S3 tool');

program
	.command('update')
	.requiredOption('--stage <stage>', 'CODE or PROD')
	.requiredOption('--file <path>', 'path to the terminologies CSV file')
	.action(async (opts) => {
		await update(stage, opts.file);
	});

program
	.command('list')
	.requiredOption('--stage <stage>', 'CODE or PROD')
	.action(async (opts) => {
		await list(stage);
	});

program
	.command('rollback')
	.requiredOption('--stage <stage>', 'CODE or PROD')
	.requiredOption(
		'--datetime <stamp>',
		'archive date/time to restore (see `list`)',
	)
	.action(async (opts) => {
		await rollback(stage, opts.datetime);
	});

program.parseAsync().catch((err) => {
	console.error('Error:', err.message);
	process.exit(1);
});
