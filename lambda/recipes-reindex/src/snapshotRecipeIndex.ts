import { Handler } from 'aws-lambda';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { StepFnState } from './types';
import { ContentUrlBase } from 'lib/recipes-data/src/lib/config';
import { INDEX_JSON } from 'lib/recipes-data/src/lib/constants';
import { recipeIndexSnapshotBucket } from './config';
import { recipeIndexSnapshotKey } from './constants';

const s3Client = new S3Client({ region: process.env['AWS_REGION'] });

export const snapshotRecipeIndexHandler: Handler<
	StepFnState,
	StepFnState
> = async (state) => {
	const recipeIndexSnapshotResponse = await fetch(
		`${ContentUrlBase}/${INDEX_JSON}`,
	);
	const recipeIndexSnapshotJson = await recipeIndexSnapshotResponse.json();

	const req = new PutObjectCommand({
		Bucket: recipeIndexSnapshotBucket,
		Key: `example/${recipeIndexSnapshotKey}`,
		Body: JSON.stringify(recipeIndexSnapshotJson),
		ContentType: 'application/json',
	});

	console.log(`Writing recipe index for invocation <X> to S3`)

	await s3Client.send(req);

	return {
		...state,
	};
};
