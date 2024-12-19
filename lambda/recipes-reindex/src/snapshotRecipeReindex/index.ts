import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Handler } from 'aws-lambda';
import { retrieveIndexData } from '@recipes-api/lib/recipes-data';
import { getContentUrlBase } from 'lib/recipes-data/src/lib/config';
import { INDEX_JSON } from 'lib/recipes-data/src/lib/constants';
import { getRecipeIndexSnapshotBucket } from '../config';
import { recipeIndexSnapshotKey } from '../constants';
import type {
	SnapshotRecipeIndexInput,
	SnapshotRecipeIndexOutput,
} from '../types';

const s3Client = new S3Client({ region: process.env['AWS_REGION'] });

export const snapshotRecipeIndexHandler: Handler<
	SnapshotRecipeIndexInput,
	SnapshotRecipeIndexOutput
> = async (state) => {
	const reindexSnapshotBucket = getRecipeIndexSnapshotBucket();
	const contentUrlBase = getContentUrlBase();
	const { executionId } = state;

	const recipeIndexUrl = `https://${contentUrlBase}/${INDEX_JSON}`;
	console.log(`Fetching recipe index from ${recipeIndexUrl}`);

	const recipeIndexSnapshotJson = await retrieveIndexData();
	const recipeArticles = Array.from(
		new Set(recipeIndexSnapshotJson.recipes.map((_) => _.capiArticleId)),
	);

	const Key = `${executionId}/${recipeIndexSnapshotKey}`;

	const req = new PutObjectCommand({
		Bucket: reindexSnapshotBucket,
		Key,
		Body: JSON.stringify(recipeArticles),
		ContentType: 'application/json',
	});

	console.log(
		`Writing recipe index for execution with ID ${executionId} to S3 at path ${reindexSnapshotBucket}/${Key}`,
	);

	await s3Client.send(req);

	console.log(
		`Written recipe index for execution with ID ${executionId} to S3 at path ${reindexSnapshotBucket}/${Key}`,
	);

	return {
		...state,
		indexObjectKey: Key,
		nextIndex: 0,
	};
};
