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

export class RecipesReindex extends Construct {
	constructor(scope: GuStack, id: string) {
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
				handler: 'main.snapshotRecipeIndex',
				functionName: `recipes-reindex-check-for-running-reindexes-${scope.stage}`,
				runtime: Runtime.NODEJS_20_X,
				initialPolicy: [
					new PolicyStatement({
						effect: Effect.ALLOW,
						actions: ['s3:GetObject', 's3:PutObject'],
						resources: [snapshotBucket.bucketArn + '/*'],
					}),
				],
				environment: {
					KEYS_TABLE: `bonobo-${scope.stage}-keys`,
				},
				architecture: Architecture.ARM_64,
				timeout: Duration.seconds(30),
				memorySize: 128,
			},
		);

		// const writeBatchToReindexQueue = new Function(
		// 	this,
		// 	'WriteBatchToReindexQueue',
		// 	{
		// 		runtime: Runtime.NODEJS_18_X,
		// 		handler: 'writeBatchToReindexQueue.handler',
		// 		code: Code.fromAsset('lambda'),
		// 	},
		// );

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
					'executionId.$': '$$.Execution.Id',
				}),
			},
		);

		// const writeBatchToReindexQueueTask = new LambdaInvoke(
		// 	this,
		// 	'WriteBatchToReindexQueueTask',
		// 	{
		// 		lambdaFunction: writeBatchToReindexQueue,
		// 		outputPath: '$.Payload',
		// 	},
		// );

		snapshotOrderedIndexTask.next(new Succeed(this, 'Success'));

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
