import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Handler } from 'aws-lambda';
import type { RecipeIndex } from 'lib/recipes-data/src/lib/models';
import type {
	WriteBatchToReindexQueueInput,
	WriteBatchToReindexQueueOutput,
} from '../types';
import { getConfig } from './config';

const s3Client = new S3Client({ region: process.env['AWS_REGION'] });

export const writeBatchToReindexQueueHandler: Handler<
	WriteBatchToReindexQueueInput,
	WriteBatchToReindexQueueOutput
> = async (state) => {
	const { executionId, currentIndex, indexObjectKey, dryRun } = state;
	const { RecipeIndexSnapshotBucket, ReindexBatchSize } = getConfig();

	const req = new GetObjectCommand({
		Bucket: RecipeIndexSnapshotBucket,
		Key: indexObjectKey,
	});

	const pathToRecipeIndex = `${RecipeIndexSnapshotBucket}/${indexObjectKey}`;

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
		currentIndex + ReindexBatchSize + 1,
		recipeIndexSnapshot.recipes.length,
	);

	const recipeIdsToReindex = recipeIndexSnapshot.recipes
		.slice(currentIndex, nextIndex)
		.map(({ recipeUID }) => recipeUID);

	const dryRunMsg = '[DRY RUN]: ';

	console.log(
		`${dryRun ? dryRunMsg : ''} writing ${
			recipeIdsToReindex.length
		} recipe ids to the reindex queue, from index ${currentIndex} to index ${
			nextIndex - 1
		}`,
	);

	await writeRecipeIdsToReindexQueue(recipeIdsToReindex);

	return {
		...state,
		currentIndex: nextIndex,
	};
};

const writeRecipeIdsToReindexQueue = async (ids: string[]) => {
	return Promise.resolve(ids);
};
