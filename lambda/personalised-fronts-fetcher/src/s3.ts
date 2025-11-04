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
	identityId: string,
	content: FeastAppContainer,
) {
	const Body = JSON.stringify(content);

	const dateStr = format(date, 'yyyy-MM-dd');
	const Key = `personalised/curation/${dateStr}/${identityId}.json`;

	return s3Client.send(
		new PutObjectCommand({
			Bucket,
			Key,
			Body,
		}),
	);
}
