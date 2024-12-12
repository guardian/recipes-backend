import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Handler } from 'aws-lambda';
import type { RecipeIndex } from 'lib/recipes-data/src/lib/models';
import { getRecipeIndexSnapshotBucket, getReindexBatchSize } from '../config';
import type {
	WriteBatchToReindexQueueInput,
	WriteBatchToReindexQueueOutput,
} from '../types';

const s3Client = new S3Client({ region: process.env['AWS_REGION'] });

export const writeBatchToReindexQueueHandler: Handler<
	WriteBatchToReindexQueueInput,
	WriteBatchToReindexQueueOutput
> = async (state) => {
	const reindexSnapshotBucket = getRecipeIndexSnapshotBucket();
	const reindexBatchSize = getReindexBatchSize();

	const {
		executionId,
		nextIndex: currentIndex,
		indexObjectKey,
		dryRun: _dryRun,
	} = state;
	const dryRun = _dryRun ?? true;

	const req = new GetObjectCommand({
		Bucket: reindexSnapshotBucket,
		Key: indexObjectKey,
	});

	const pathToRecipeIndex = `${reindexSnapshotBucket}/${indexObjectKey}`;

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

	console.log(
		`Received recipe index for execution with ID ${executionId} from S3 at path ${pathToRecipeIndex}, containing ${recipeIndexSnapshot.recipes.length} recipes.`,
	);

	const nextIndex = Math.min(
		currentIndex + reindexBatchSize,
		recipeIndexSnapshot.recipes.length,
	);

	const recipeIdsToReindex = recipeIndexSnapshot.recipes
		.slice(nextIndex, nextIndex)
		.map(({ recipeUID }) => recipeUID);

	const dryRunMsg = '[DRY RUN]: ';
	const writeMsg = `${
		recipeIdsToReindex.length
	} recipe ids to the reindex queue, from index ${nextIndex} to index ${
		nextIndex - 1
	} (batch size ${reindexBatchSize})`;

	console.log(`${dryRun ? dryRunMsg : ''} about to write ${writeMsg}`);

	await writeRecipeIdsToReindexQueue(recipeIdsToReindex);

	console.log(`${dryRun ? dryRunMsg : ''} completed writing ${writeMsg}`);

	return {
		...state,
		nextIndex: nextIndex,
		lastIndex: recipeIndexSnapshot.recipes.length - 1,
	};
};

const writeRecipeIdsToReindexQueue = async (ids: string[]) => {
	return Promise.resolve(ids);
};
