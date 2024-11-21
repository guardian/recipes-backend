import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Handler } from 'aws-lambda';
import { ContentUrlBase } from 'lib/recipes-data/src/lib/config';
import { INDEX_JSON } from 'lib/recipes-data/src/lib/constants';
import type { RecipeIndex } from 'lib/recipes-data/src/lib/models';
import { recipeIndexSnapshotBucket } from './config';
import { recipeIndexSnapshotKey } from './constants';
import type { StepFnState } from './types';

const s3Client = new S3Client({ region: process.env['AWS_REGION'] });

export const snapshotRecipeIndexHandler: Handler<
	StepFnState,
	StepFnState
> = async (state) => {
	const recipeIndexSnapshotResponse = await fetch(
		`${ContentUrlBase}/${INDEX_JSON}`,
	);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- absent Zod types for the index, casting is necessary
	const recipeIndexSnapshotJson: RecipeIndex =
		await recipeIndexSnapshotResponse.json();

	const req = new PutObjectCommand({
		Bucket: recipeIndexSnapshotBucket,
		Key: `example/${recipeIndexSnapshotKey}`,
		Body: JSON.stringify(recipeIndexSnapshotJson),
		ContentType: 'application/json',
	});

	console.log(`Writing recipe index for invocation <X> to S3`);

	await s3Client.send(req);

	return {
		...state,
	};
};
