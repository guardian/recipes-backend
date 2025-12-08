import { GuParameter, type GuStack } from '@guardian/cdk/lib/constructs/core';
import { aws_sns, Duration } from 'aws-cdk-lib';
import {
	Alarm,
	ComparisonOperator,
	Metric,
	TreatMissingData,
} from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import {
	AccountPrincipal,
	Effect,
	PolicyDocument,
	PolicyStatement,
	Role,
} from 'aws-cdk-lib/aws-iam';
import type { IBucket } from 'aws-cdk-lib/aws-s3';
import { CfnOutput } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import type { ExternalParameters } from './external_parameters';

interface PersonalisedFrontsProps {
	destBucket: IBucket;
	externalParameters: ExternalParameters;
}

export class PersonalisedFronts extends Construct {
	constructor(scope: GuStack, name: string, props: PersonalisedFrontsProps) {
		super(scope, name);

		const base_path = 'personalised/curation';

		const dataTechCrossAccountARN = new GuParameter(
			scope,
			'PersonalisedFrontsCrossAccountARN',
			{
				fromSSM: true,
				default: `/INFRA/recipes-backend/personalised-fronts-fetcher/data-tech-account-arn`,
				type: 'String',
			},
		);

		const dataTechCrossAccountID = new GuParameter(
			scope,
			'PersonalisedFrontsSrcAcct',
			{
				fromSSM: true,
				default: `/INFRA/recipes-backend/personalised-fronts-fetcher/data-tech-account-id`,
				type: 'String',
			},
		);

		const iamRole = new Role(this, 'FetcherRole', {
			roleName: `personalised-fronts-fetcher-${scope.stage}`,
			assumedBy: new AccountPrincipal(dataTechCrossAccountID.valueAsString),
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
				CrossAccount: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ['sts:AssumeRole'],
							effect: Effect.ALLOW,
							resources: [dataTechCrossAccountARN.valueAsString],
						}),
					],
				}),
			},
		});

		new CfnOutput(this, 'XARNameOutput', {
			description:
				'Cross-account role for Airflow to trigger the personalised fronts fetcher',
			value: iamRole.roleArn,
			key: 'PersonalisedFrontsFetcherXAR',
		});

		const nonUrgentAlarmTopic = aws_sns.Topic.fromTopicArn(
			this,
			'nonurgent-alarm',
			props.externalParameters.nonUrgentAlarmTopicArn.stringValue,
		);
		const failedPersonalisedContainerMetric = new Metric({
			namespace: 'RecipeBackend',
			metricName: 'FailedPersonalisedContainer',
			statistic: 'Average',
			period: Duration.hours(1),
		});
		const failedPersonalisedContainerAlarm = new Alarm(
			this,
			'FailedPersonalisedContainerAlarm',
			{
				metric: failedPersonalisedContainerMetric,
				threshold: 1,
				evaluationPeriods: 1,
				comparisonOperator:
					ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
				alarmDescription:
					'Raised if any failed personalised container metric is recorded in a hour',
				treatMissingData: TreatMissingData.NOT_BREACHING,
			},
		);

		failedPersonalisedContainerAlarm.addAlarmAction(
			new SnsAction(nonUrgentAlarmTopic),
		);
	}
}
