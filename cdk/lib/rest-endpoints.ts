import { GuApiLambda } from '@guardian/cdk';
import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { aws_sns, Duration } from 'aws-cdk-lib';
import { EndpointType } from 'aws-cdk-lib/aws-apigateway';
import {
	Alarm,
	ComparisonOperator,
	Metric,
	TreatMissingData,
} from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import type { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import type { DataStore } from './datastore';
import type { ExternalParameters } from './external_parameters';

interface RestEndpointsProps {
	servingBucket: IBucket;
	fastlyKey: string;
	contentUrlBase: string;
	dataStore: DataStore;
	externalParameters: ExternalParameters;
}

export class RestEndpoints extends Construct {
	constructor(scope: GuStack, id: string, props: RestEndpointsProps) {
		super(scope, id);

		const { servingBucket, fastlyKey, contentUrlBase, dataStore } = props;

		const apiConstruct = new GuApiLambda(scope, 'Lambda', {
			api: {
				id: `recipes-backend-${scope.stage}`,
				endpointTypes: [EndpointType.REGIONAL],
			},
			app: 'recipes-backend-rest-endpoints',
			architecture: Architecture.ARM_64,
			description: 'REST API endpoints for the recipe backend',
			environment: {
				STATIC_BUCKET: servingBucket.bucketName,
				FASTLY_API_KEY: fastlyKey,
				CONTENT_URL_BASE: contentUrlBase,
				INDEX_TABLE: dataStore.table.tableName,
			},
			fileName: 'rest-endpoints.zip',
			functionName: `recipes-backend-rest-endpoints-${scope.stage}`,
			handler: 'main.handler',
			memorySize: 256,
			monitoringConfiguration: { noMonitoring: true }, //for the time being
			runtime: Runtime.NODEJS_20_X,
			timeout: Duration.seconds(30),
			initialPolicy: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['dynamodb:Query'],
					resources: [
						`${dataStore.table.tableArn}`,
						`${dataStore.table.tableArn}/index/*`,
					],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['s3:GetObject'],
					resources: [`${servingBucket.bucketArn}/*`],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['cloudwatch:PutMetricData'],
					resources: ['*'],
				}),
			],
		});

		apiConstruct.api.addUsagePlan('UsagePlan', {
			name: `recipes-backend-${scope.stage}`,
			description: 'REST endpoints for recipes backend',
			apiStages: [
				{
					stage: apiConstruct.api.deploymentStage,
					api: apiConstruct.api,
				},
			],
		});

		const nonUrgentAlarmTopic = aws_sns.Topic.fromTopicArn(
			this,
			'nonurgent-alarm',
			props.externalParameters.nonUrgentAlarmTopicArn.stringValue,
		);

		const noneOrTooLessContainersMetric = new Metric({
			namespace: 'RecipeBackend',
			metricName: 'NoneOrTooLessContainers',
			statistic: 'Sum',
			period: Duration.hours(1),
		});
		const noneOrTooLessContainersAlarm = new Alarm(
			this,
			'NoneOrTooLessContainersAlarm',
			{
				metric: noneOrTooLessContainersMetric,
				threshold: 1,
				evaluationPeriods: 1,
				comparisonOperator:
					ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
				alarmDescription:
					'Raised if the NoneOrTooLessContainers metric is recorded in an hour',
				treatMissingData: TreatMissingData.NOT_BREACHING,
			},
		);

		noneOrTooLessContainersAlarm.addAlarmAction(
			new SnsAction(nonUrgentAlarmTopic),
		);

		const tooManyContainersMetric = new Metric({
			namespace: 'RecipeBackend',
			metricName: 'TooManyContainers',
			statistic: 'Sum',
			period: Duration.hours(1),
		});
		const tooManyContainersAlarm = new Alarm(this, 'TooManyContainersAlarm', {
			metric: tooManyContainersMetric,
			threshold: 1,
			evaluationPeriods: 1,
			comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
			alarmDescription:
				'Raised if the TooManyContainers metric is recorded in an hour',
			treatMissingData: TreatMissingData.NOT_BREACHING,
		});

		tooManyContainersAlarm.addAlarmAction(new SnsAction(nonUrgentAlarmTopic));
	}
}
