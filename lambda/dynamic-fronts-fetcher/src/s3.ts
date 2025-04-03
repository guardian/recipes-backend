import * as process from 'node:process';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import format from 'date-fns/format';
import type { FeastAppContainer } from '@recipes-api/lib/facia';

const s3Client = new S3Client({
	region: process.env['AWS_REGION'] ?? 'eu-west-1',
});

export async function writeDynamicData(
	Bucket: string,
	date: Date,
	territory: string,
	content: FeastAppContainer,
) {
	const Body = JSON.stringify(content);

	const dateStr = format(date, 'dd-MM-yyyy');
	const Key = `dynamic/curation/${dateStr}/${territory}.json`;

	return s3Client.send(
		new PutObjectCommand({
			Bucket,
			Key,
			Body,
		}),
	);
}
