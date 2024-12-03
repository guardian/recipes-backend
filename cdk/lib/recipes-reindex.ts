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
	Wait,
	WaitTime,
} from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

type RecipesReindexProps = {
	contentUrlBase: string;
	reindexBatchSize: string;
};

export class RecipesReindex extends Construct {
	constructor(
		scope: GuStack,
		id: string,
		{ contentUrlBase, reindexBatchSize }: RecipesReindexProps,
	) {
		super(scope, id);

		const appBase = 'recipes-reindex';
		const lambdaFileName = `${appBase}.zip`;

		const snapshotBucket = new Bucket(this, 'staticServing', {
			bucketName: `recipes-backend-reindex-snapshots-${scope.stage.toLowerCase()}`,
			enforceSSL: true,
			removalPolicy: RemovalPolicy.DESTROY,
		});

		const snapshotRecipeIndex = new GuLambdaFunction(
			scope,
			'SnapshotRecipeIndexLambda',
			{
				app: `${appBase}-snapshot-recipe-index`,
				description: 'Store a snapshot of the current recipe index in S3',
				fileName: lambdaFileName,
				handler: 'main.snapshotRecipeIndexHandler',
				functionName: `${appBase}-snapshot-recipe-index-${scope.stage}`,
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
				app: `${appBase}-write-batch-to-index-queue`,
				description: 'Write a batch of recipe ids to the reindex queue',
				fileName: lambdaFileName,
				handler: 'main.writeBatchToReindexQueueHandler',
				functionName: `${appBase}-write-batch-to-reindex-queue-${scope.stage}`,
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
				inputPath: '$.Payload',
			},
		);

		const waitForThroughputAndWriteNextBatch = new Wait(
			scope,
			'WaitForThroughPut',
			{
				time: WaitTime.duration(Duration.seconds(1)),
			},
		).next(writeBatchToReindexQueueTask);

		const isReindexComplete = new Choice(this, 'IsReindexComplete')
			.when(
				Condition.numberGreaterThanJsonPath(
					'$.Payload.nextIndex',
					'$.Payload.lastIndex',
				),
				new Succeed(this, 'Reindex complete'),
			)
			.otherwise(waitForThroughputAndWriteNextBatch);

		snapshotOrderedIndexTask
			.next(writeBatchToReindexQueueTask)
			.next(isReindexComplete);

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

		const stateMachine = new StateMachine(this, 'ReindexingStateMachine', {
			definition,
			timeout: Duration.minutes(15),
		});

		stateMachine.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: [
					`arn:aws:states:eu-west-1:${scope.account}:execution:${stateMachine.stateMachineName}:*`,
				],
				actions: ['states:ListExecutions'],
			}),
		);
	}
}
