import { GuApiLambda } from '@guardian/cdk';
import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { Duration } from 'aws-cdk-lib';
import { EndpointType } from 'aws-cdk-lib/aws-apigateway';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import type { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import type { DataStore } from './datastore';

interface RestEndpointsProps {
	servingBucket: IBucket;
	fastlyKey: string;
	contentUrlBase: string;
	dataStore: DataStore;
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
	}
}
