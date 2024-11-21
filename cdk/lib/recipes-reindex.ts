import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import {
	Choice,
	Condition,
	CustomState,
	Fail,
	StateMachine,
	Succeed,
	TaskInput,
} from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

type RecipesReindexProps = {
	contentUrlBase: string;
	reindexBatchSize: number;
};

export class RecipesReindex extends Construct {
	constructor(
		scope: GuStack,
		id: string,
		{ contentUrlBase, reindexBatchSize }: RecipesReindexProps,
	) {
		super(scope, id);

		const snapshotBucket = new Bucket(this, 'staticServing', {
			bucketName: `recipes-backend-reindex-snapshots-${scope.stage.toLowerCase()}`,
			enforceSSL: true,
			removalPolicy: RemovalPolicy.DESTROY,
		});

		const snapshotRecipeIndex = new GuLambdaFunction(
			scope,
			'SnapshotRecipeIndexLambda',
			{
				app: 'recipes-reindex',
				description: 'Store a snapshot of the current recipe index in S3',
				fileName: 'recipes-reindex.zip',
				handler: 'main.snapshotRecipeIndexHandler',
				functionName: `recipes-reindex-snapshot-recipe-index-${scope.stage}`,
				runtime: Runtime.NODEJS_20_X,
				initialPolicy: [
					new PolicyStatement({
						effect: Effect.ALLOW,
						actions: ['s3:PutObject'],
						resources: [snapshotBucket.bucketArn + '/*'],
					}),
				],
				environment: {
					CONTENT_URL_BASE: contentUrlBase,
					RECIPE_INDEX_SNAPSHOT_BUCKET: snapshotBucket.bucketName,
				},
				architecture: Architecture.ARM_64,
				timeout: Duration.seconds(30),
				memorySize: 128,
			},
		);

		const writeBatchToReindexQueue = new GuLambdaFunction(
			scope,
			'WriteBatchToReindexQueueLambda',
			{
				app: 'recipes-reindex',
				description: 'Write a batch of recipe ids to the reindex queue',
				fileName: 'recipes-reindex.zip',
				handler: 'main.writeBatchToReindexQueueHandler',
				functionName: `recipes-reindex-write-batch-to-reindex-queue-${scope.stage}`,
				runtime: Runtime.NODEJS_20_X,
				initialPolicy: [
					new PolicyStatement({
						effect: Effect.ALLOW,
						actions: ['s3:GetObject'],
						resources: [snapshotBucket.bucketArn + '/*'],
					}),
				],
				environment: {
					RECIPE_INDEX_SNAPSHOT_BUCKET: snapshotBucket.bucketName,
					REINDEX_BATCH_SIZE: reindexBatchSize.toString(),
				},
				architecture: Architecture.ARM_64,
				timeout: Duration.seconds(30),
				memorySize: 128,
			},
		);

		// Define the Step Functions tasks
		const checkForOtherRunningReindexesTask = new CustomState(
			scope,
			'checkForOtherRunningTasks',
			{
				stateJson: {
					Type: 'Task',
					Parameters: {
						StatusFilter: 'RUNNING',
						// The ARN of the running state machine
						'StateMachineArn.$': '$$.StateMachine.Id',
					},
					Resource: 'arn:aws:states:::aws-sdk:sfn:listExecutions',
				},
			},
		);

		const snapshotOrderedIndexTask = new LambdaInvoke(
			this,
			'SnapshotOrderedIndexTask',
			{
				lambdaFunction: snapshotRecipeIndex,
				payload: TaskInput.fromObject({
					'executionId.$': '$$.Execution.Name',
				}),
			},
		);

		const writeBatchToReindexQueueTask = new LambdaInvoke(
			this,
			'WriteBatchToReindexQueueTask',
			{
				lambdaFunction: writeBatchToReindexQueue,
			},
		);

		snapshotOrderedIndexTask
			.next(writeBatchToReindexQueueTask)
			.next(new Succeed(this, 'Success'));

		const isOnlyRunningReindex = new Choice(this, 'IsOnlyRunningReindex')
			.when(Condition.isNotPresent('$.Executions[1]'), snapshotOrderedIndexTask)
			.otherwise(
				new Fail(this, 'Fail', {
					error: 'ReindexingError',
					cause: 'Other reindexes running',
				}),
			);

		// Define the state machine
		const definition =
			checkForOtherRunningReindexesTask.next(isOnlyRunningReindex);
		// .next(snapshotOrderedIndexTask)
		// .next(writeBatchToReindexQueueTask)
		// .next(waitForThroughputTask)
		// .next(writeBatchToReindexQueueTask)

		const stateMachine = new StateMachine(this, 'ReindexingStateMachine', {
			definition,
			timeout: Duration.minutes(15),
		});

		stateMachine.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: ['*'],
				actions: ['states:ListExecutions'],
			}),
		);
	}
}
