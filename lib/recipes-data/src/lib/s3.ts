import * as process from 'process';
import {
	DeleteObjectCommand,
	HeadObjectCommand,
	NoSuchKey,
	NotFound,
	PutObjectCommand,
	S3Client,
	S3ServiceException,
} from '@aws-sdk/client-s3';
import { MaximumRetries } from './config';
import type { PurgeType } from './fastly';
import {
	FastlyError,
	sendFastlyPurgeRequest,
	sendFastlyPurgeRequestWithRetries,
} from './fastly';
import type { ChefInfoFile, RecipeIndex, RecipeReference } from './models';
import { awaitableDelay } from './utils';

const s3Client = new S3Client({ region: process.env['AWS_REGION'] });

const DefaultCacheControlParams = makeCacheControl();

function makeCacheControl(
	maxAge?: number,
	staleRevalidate?: number,
	staleError?: number,
): string {
	return [
		`max-age=${maxAge ?? 31557600}`,
		`stale-while-revalidate=${staleRevalidate ?? 60}`,
		`stale-if-error=${staleError ?? 300}`,
	].join('; ');
}

/**
 * Publishes the given recipe data into the output bucket.
 *
 * S3 errors are automatically retried with a delay, as configured by the MAX_RETRIES & RETRY_DELAY parameters
 *
 * @param recipe data structure giving the uid, json content and the checksum
 * @param attempt used internally to track retries
 * @return a promise which resolves to void on success or errors on failure
 */
export async function publishRecipeContent({
	recipe,
	staticBucketName,
	fastlyApiKey,
	contentPrefix,
	attempt,
}: {
	recipe: RecipeReference;
	staticBucketName: string;
	fastlyApiKey: string;
	contentPrefix: string;
	attempt?: number;
}): Promise<void> {
	const realAttempt = attempt ?? 1;
	if (!recipe.checksum) {
		throw new Error(
			'publishRecipeContent: Cannot output recipe data without a checksum',
		);
	}

	const Key = `content/${recipe.checksum}`;

	const req = new PutObjectCommand({
		Bucket: staticBucketName,
		Key,
		Body: recipe.jsonBlob,
		ContentType: 'application/json',
		//ChecksumSHA256: recipe.checksum,  //This is commented out because the format is wrong. Left here because we want to fix it but not hold up PR approval.
		CacheControl: DefaultCacheControlParams,
	});

	try {
		await s3Client.send(req);
		//TODO - check if "hard" or "soft" purging is the right option here
		await sendFastlyPurgeRequestWithRetries({
			contentPath: Key,
			apiKey: fastlyApiKey,
			contentPrefix,
			purgeType: 'hard',
		});
	} catch (err) {
		if (err instanceof S3ServiceException) {
			console.warn(`Unable to write to S3 on attempt ${realAttempt}: `, err);
			if (
				MaximumRetries &&
				!isNaN(MaximumRetries) &&
				realAttempt < MaximumRetries
			) {
				await awaitableDelay();
				return publishRecipeContent({
					recipe,
					staticBucketName: staticBucketName,
					fastlyApiKey,
					contentPrefix,
					attempt: realAttempt + 1,
				});
			} else {
				throw new Error('Could not write to S3, see logs for details.');
			}
		} else if (err instanceof FastlyError) {
			console.warn(`Unable to flush Fastly cache: `, err);
		} else {
			throw err;
		}
	}
}

export async function removeRecipeContent({
	recipeSHA,
	staticBucketName,
	fastlyApiKey,
	contentPrefix,
	purgeType,
	attempt,
}: {
	recipeSHA: string;
	staticBucketName: string;
	fastlyApiKey: string;
	contentPrefix: string;
	purgeType?: PurgeType;
	attempt?: number;
}): Promise<void> {
	const realAttempt = attempt ?? 1;

	const Key = `content/${recipeSHA}`;

	const req = new DeleteObjectCommand({
		Bucket: staticBucketName,
		Key,
	});

	try {
		await s3Client.send(req);
		await sendFastlyPurgeRequestWithRetries({
			contentPath: Key,
			apiKey: fastlyApiKey,
			contentPrefix,
			purgeType: purgeType ?? 'hard',
		});
	} catch (err) {
		if (err instanceof NoSuchKey) {
			console.log(
				`removeRecipeContent: No recipe existed at version ${recipeSHA} so I could not remove it.`,
			);
			return;
		} else if (err instanceof S3ServiceException) {
			console.warn(`Unable to delete from S3 on attempt ${realAttempt}: `, err);
			if (
				MaximumRetries &&
				!isNaN(MaximumRetries) &&
				realAttempt < MaximumRetries
			) {
				await awaitableDelay();
				return removeRecipeContent({
					recipeSHA,
					staticBucketName: staticBucketName,
					fastlyApiKey,
					contentPrefix,
					purgeType,
					attempt: realAttempt + 1,
				});
			} else {
				throw new Error('Could not delete from S3, see logs for details.');
			}
		} else {
			throw err;
		}
	}
}

async function getExistingEtag(Key: string): Promise<string | undefined> {
	const check = new HeadObjectCommand({
		Bucket,
		Key,
	});

	try {
		const checkResponse = await s3Client.send(check);
		return checkResponse.ETag;
	} catch (e) {
		if (e instanceof NotFound) {
			console.log(`${Key} did not exist in ${Bucket}`);
		}
	}
}

/**
 * Writes the built index data out to S3
 * @param indexData built indexdata object. Get this from `retrieveIndexData`
 * @param Key filename to write in S3
 */
export async function writeIndexData({
	indexData,
	Key,
	staticBucketName,
	contentPrefix,
	fastlyApiKey,
}: {
	indexData: RecipeIndex;
	Key: string;
	staticBucketName: string;
	contentPrefix: string;
	fastlyApiKey: string;
}) {
	console.log('Marshalling data...');
	const formattedData = JSON.stringify(indexData);

	console.log(`Done. Writing to s3://${staticBucketName}/${Key}...`);
	const req = new PutObjectCommand({
		Bucket: staticBucketName,
		Key,
		Body: formattedData,
		ContentType: 'application/json',
		CacheControl: makeCacheControl(3600), //cache for up to 60mins
	});

	await s3Client.send(req);
	console.log('Done. Purging CDN...');
	await sendFastlyPurgeRequest({
		contentPath: Key,
		apiKey: fastlyApiKey,
		contentPrefix,
	});
	console.log('Done.');
}

export async function writeChefData(chefData: ChefInfoFile, Key: string) {
	console.log('Marshalling data...');
	const formattedData = JSON.stringify(chefData);

	const prevEtag = await getExistingEtag(Key);
	console.log(`Old etag is ${prevEtag ?? '(undefined)'}`);

	console.log(`Done. Writing to s3://${Bucket}/${Key}...`);
	const req = new PutObjectCommand({
		Bucket,
		Key,
		Body: formattedData,
		ContentType: 'application/json',
		CacheControl: DefaultCacheControlParams,
	});

	await s3Client.send(req);
	console.log('Done. Purging CDN...');
	const newEtag = await getExistingEtag(Key);
	console.log(`New etag is ${newEtag ?? '(undefined)'}`);
	if (!!prevEtag && newEtag != prevEtag) {
		await sendFastlyPurgeRequest(Key, FastlyApiKey ?? '');
		console.log('Done.');
	} else {
		console.log('No change detected to contributor data, not flushing cache');
	}
}
