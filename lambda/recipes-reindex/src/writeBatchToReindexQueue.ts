import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Handler } from 'aws-lambda';
import type { RecipeIndex } from 'lib/recipes-data/src/lib/models';
import { recipeIndexSnapshotBucket, reindexBatchSize } from './config';
import type {
	WriteBatchToReindexQueueInput,
	WriteBatchToReindexQueueOutput,
} from './types';

const s3Client = new S3Client({ region: process.env['AWS_REGION'] });

export const writeBatchToReindexQueueHandler: Handler<
	WriteBatchToReindexQueueInput,
	WriteBatchToReindexQueueOutput
> = async (state) => {
	const { executionId, currentIndex, indexObjectKey, dryRun } = state;

	const req = new GetObjectCommand({
		Bucket: recipeIndexSnapshotBucket,
		Key: indexObjectKey,
	});

	const pathToRecipeIndex = `${recipeIndexSnapshotBucket}/${indexObjectKey}`;

	console.log(
		`Reading recipe index for execution with ID ${executionId} from S3 at path ${pathToRecipeIndex}`,
	);

	const response = await s3Client.send(req);

	if (!response.Body) {
		throw new Error(
			`Read recipe index at ${pathToRecipeIndex}, but the response body was empty`,
		);
	}

	const recipeIndexSnapshotJson =
		await response.Body.transformToString('utf-8');

	const recipeIndexSnapshot = JSON.parse(
		recipeIndexSnapshotJson,
	) as RecipeIndex;

	const nextIndex = Math.min(
		currentIndex + reindexBatchSize + 1,
		recipeIndexSnapshot.recipes.length,
	);

	const recipeIdsToReindex = recipeIndexSnapshot.recipes
		.slice(currentIndex, nextIndex)
		.map(({ recipeUID }) => recipeUID);

	await writeRecipeIdsToReindexQueue(recipeIdsToReindex, dryRun);

	return {
		...state,
		currentIndex: nextIndex,
	};
};

const writeRecipeIdsToReindexQueue = async (ids: string[], dryRun = false) => {
	const dryRunMsg = '[DRY RUN]: ';
	console.log(
		`${dryRun ? dryRunMsg : ''} writing ${
			ids.length
		} recipe ides to the reindex queue`,
	);

	return Promise.resolve();
};
