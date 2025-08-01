import { GuParameter, type GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import {
	AccountPrincipal,
	Effect,
	ManagedPolicy,
	PolicyDocument,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import type { IBucket } from 'aws-cdk-lib/aws-s3';
import { CfnOutput } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

interface DynamicFrontsProps {
	destBucket: IBucket;
}

export class DynamicFronts extends Construct {
	constructor(scope: GuStack, name: string, props: DynamicFrontsProps) {
		super(scope, name);

		const base_path = 'dynamic/curation';

		const lambdaRole = new Role(this, 'FetcherRole', {
			//The role name needs to be short for cross-cloud federation or you
			//get an incomprehensible error!
			roleName: `dynamic-fronts-fetcher-${scope.stage}`,
			assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
			managedPolicies: [
				ManagedPolicy.fromAwsManagedPolicyName(
					'service-role/AWSLambdaBasicExecutionRole',
				),
			],
			inlinePolicies: {
				S3Put: new PolicyDocument({
					statements: [
						new PolicyStatement({
							effect: Effect.ALLOW,
							actions: ['s3:PutObject', 's3:GetObject'],
							resources: [`${props.destBucket.bucketArn}/${base_path}/*`],
						}),
					],
				}),
				MetricPut: new PolicyDocument({
					statements: [
						new PolicyStatement({
							effect: Effect.ALLOW,
							resources: ['*'],
							actions: ['cloudwatch:PutMetricData'],
						}),
					],
				}),
			},
		});

		const fetcher = new GuLambdaFunction(scope, 'DynamicFrontsFetcher', {
			fileName: 'dynamic-fronts-fetcher.zip',
			handler: 'main.handler',
			functionName: `dynamic-fetcher-${scope.stage}`,
			runtime: Runtime.NODEJS_20_X,
			app: 'dynamic-fronts-fetcher',
			memorySize: 256,
			environment: {
				BUCKET_NAME: props.destBucket.bucketName,
				BASE_PATH: base_path,
			},
			role: lambdaRole,
		});

		const dataTechAcctParam = new GuParameter(scope, 'DynamicFrontsSrcAcct', {
			fromSSM: true,
			default: `/INFRA/recipes-backend/dynamic-fronts-fetcher/data-tech-account-id`,
			type: 'String',
		});

		const xar = new Role(this, 'XAR', {
			inlinePolicies: {
				invokeFetcher: new PolicyDocument({
					statements: [
						new PolicyStatement({
							effect: Effect.ALLOW,
							resources: [fetcher.functionArn],
							actions: ['lambda:InvokeFunction'],
						}),
					],
				}),
			},
			assumedBy: new AccountPrincipal(dataTechAcctParam.valueAsString),
		});

		new CfnOutput(this, 'XARNameOutput', {
			description:
				'Cross-account role for Airflow to trigger the dynamic fronts fetcher',
			value: xar.roleArn,
			key: 'DynamicFrontsFetcherXAR',
		});
	}
}
