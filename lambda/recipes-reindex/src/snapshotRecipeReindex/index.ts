import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Handler } from 'aws-lambda';
import { INDEX_JSON } from 'lib/recipes-data/src/lib/constants';
import type { RecipeIndex } from 'lib/recipes-data/src/lib/models';
import { recipeIndexSnapshotKey } from '../constants';
import type {
	SnapshotRecipeIndexInput,
	SnapshotRecipeIndexOutput,
} from '../types';
import { getConfig } from './config';

const s3Client = new S3Client({ region: process.env['AWS_REGION'] });

export const snapshotRecipeIndexHandler: Handler<
	SnapshotRecipeIndexInput,
	SnapshotRecipeIndexOutput
> = async (state) => {
	const { ContentUrlBase, RecipeIndexSnapshotBucket } = getConfig();
	const { executionId } = state;

	const recipeIndexUrl = `https://${ContentUrlBase}/${INDEX_JSON}`;
	console.log(`Fetching recipe index from ${recipeIndexUrl}`);
	const recipeIndexSnapshotResponse = await fetch(recipeIndexUrl);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- absent Zod types for the index, casting is necessary
	const recipeIndexSnapshotJson: RecipeIndex =
		await recipeIndexSnapshotResponse.json();

	const Key = `${executionId}/${recipeIndexSnapshotKey}`;

	const req = new PutObjectCommand({
		Bucket: RecipeIndexSnapshotBucket,
		Key,
		Body: JSON.stringify(recipeIndexSnapshotJson),
		ContentType: 'application/json',
	});

	console.log(
		`Writing recipe index for execution with ID ${executionId} to S3 at path ${RecipeIndexSnapshotBucket}/${Key}`,
	);

	await s3Client.send(req);

	console.log(
		`Written recipe index for execution with ID ${executionId} to S3 at path ${RecipeIndexSnapshotBucket}/${Key}`,
	);

	return {
		...state,
		indexObjectKey: Key,
		currentIndex: 0,
	};
};
