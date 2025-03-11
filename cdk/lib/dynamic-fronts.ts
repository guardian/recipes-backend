import { GuParameter, type GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import {
	AccountPrincipal,
	Effect,
	PolicyDocument,
	PolicyStatement,
	Role,
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

		const base_path = 'dynamic-fronts-data';

		const fetcher = new GuLambdaFunction(scope, 'DynamicFrontsFetcher', {
			fileName: 'dynamic-fronts-fetcher.zip',
			handler: 'main.handler',
			runtime: Runtime.NODEJS_20_X,
			app: 'dynamic-fronts-fetcher',
			memorySize: 128,
			environment: {
				DEST_BUCKET: props.destBucket.bucketName,
				BASE_PATH: base_path,
			},
			initialPolicy: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['s3:PutObject', 's3:GetObject'],
					resources: [`${props.destBucket.bucketArn}/${base_path}`],
				}),
			],
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
							actions: ['lambda:Invoke'],
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
