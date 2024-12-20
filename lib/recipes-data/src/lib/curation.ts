import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import format from 'date-fns/format';
import { AwsRegion } from './config';
import { sendFastlyPurgeRequestWithRetries } from './fastly';

const s3client = new S3Client({ region: AwsRegion });

export async function deployCurationData(
	content: string | Buffer,
	region: string,
	variant: string,
	maybeDate: Date | null,
	{
		staticBucketName,
		fastlyApiKey,
		contentPrefix,
	}: {
		staticBucketName: string;
		fastlyApiKey: string;
		contentPrefix: string;
	},
): Promise<void> {
	const Key = maybeDate
		? `${region}/${variant}/${format(maybeDate, 'yyyy-MM-dd')}/curation.json`
		: `${region}/${variant}/curation.json`;

	const req = new PutObjectCommand({
		Bucket: staticBucketName,
		Key,
		Body: content,
		ContentType: 'application/json',
		CacheControl: 'max-age=120; stale-while-revalidate=10; stale-if-error=300',
	});

	console.log(`Uploading new curation data to ${staticBucketName}/${Key}`);
	await s3client.send(req);
	console.log('Done. Flushing CDN cache...');
	await sendFastlyPurgeRequestWithRetries({
		contentPath: Key,
		apiKey: fastlyApiKey,
		contentPrefix,
		purgeType: 'hard',
	});
}
