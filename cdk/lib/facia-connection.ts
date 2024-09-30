import type { GuParameter, GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import type { ExternalParameters } from './external_parameters';
import type { StaticServing } from './static-serving';

interface FaciaConnectionProps {
	fastlyKeyParam: GuParameter;
	serving: StaticServing;
	externalParameters: ExternalParameters;
	faciaPublishStatusSNSRoleARN: string;
	faciaPublishStatusSNSTopicARN: string;
	faciaPublishSNSTopicARN: string;
	contentUrlBase: string;
}

export class FaciaConnection extends Construct {
	constructor(
		scope: GuStack,
		id: string,
		{
			faciaPublishSNSTopicARN,
			faciaPublishStatusSNSTopicARN,
			faciaPublishStatusSNSRoleARN,
			externalParameters,
			fastlyKeyParam,
			serving,
			contentUrlBase,
		}: FaciaConnectionProps,
	) {
		super(scope, id);

		const faciaPublishStatusSNSTopic = Topic.fromTopicArn(
			this,
			'faciaPublishStatusSNSTopic',
			faciaPublishStatusSNSTopicARN,
		);

		const faciaPublishStatusSNSRole = Role.fromRoleArn(
			scope,
			'faciaPublishStatusSNSTopicRole',
			faciaPublishStatusSNSRoleARN,
		);

		const faciaPublishSNSTopic = Topic.fromTopicArn(
			this,
			'faciaPublishSNSTopic',
			faciaPublishSNSTopicARN,
		);

		const faciaDLQ = new Queue(this, 'DLQ');

		const faciaQueue = new Queue(this, 'Connection', {
			enforceSSL: true,
			deadLetterQueue: {
				queue: faciaDLQ,
				maxReceiveCount: 1,
			},
		});

		faciaPublishSNSTopic.addSubscription(new SqsSubscription(faciaQueue));

		new GuLambdaFunction(scope, 'RecipesFaciaResponder', {
			events: [
				new SqsEventSource(faciaQueue, {
					batchSize: 1, //we are not expecting heavy traffic so just invoke as the records arrive, one-by-one
					maxConcurrency: 5,
				}),
			],
			errorPercentageMonitoring: {
				toleratedErrorPercentage: 1,
				snsTopicName: externalParameters.nonUrgentAlarmTopicArn.stringValue,
			},
			app: 'recipes-facia-responder',
			architecture: Architecture.ARM_64,
			environment: {
				FASTLY_API_KEY: fastlyKeyParam.valueAsString,
				STATIC_BUCKET: serving.staticBucket.bucketName,
				CONTENT_URL_BASE: contentUrlBase,
				FACIA_PUBLISH_STATUS_TOPIC_ARN: faciaPublishStatusSNSTopic.topicArn,
				FACIA_PUBLISH_STATUS_ROLE_ARN: faciaPublishStatusSNSRole.roleArn,
			},
			fileName: 'facia-responder.zip',
			functionName: `RecipesFaciaResponder-${scope.stage}`,
			handler: 'main.handler',
			initialPolicy: [
				new PolicyStatement({
					effect: Effect.DENY,
					resources: [
						serving.staticBucket.bucketArn + '/content/*',
						serving.staticBucket.bucketArn + '/index.json',
					],
					actions: ['s3:*'],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					resources: [serving.staticBucket.bucketArn + '/*'],
					actions: ['s3:PutObject', 's3:ListObjects'],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['sts:AssumeRole'],
					resources: [faciaPublishStatusSNSRole.roleArn],
				}),
			],
			memorySize: 256,
			runtime: Runtime.NODEJS_18_X,
			timeout: Duration.seconds(10),
		});
	}
}
