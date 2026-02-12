import { GuScheduledLambda } from '@guardian/cdk';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuParameter, GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import { type App, aws_events_targets, aws_sns, Duration } from 'aws-cdk-lib';
import {
	Alarm,
	ComparisonOperator,
	TreatMissingData,
	Unit,
} from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { EventBus, Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { DataStore } from './datastore';
import { DynamicFronts } from './dynamic-fronts';
import { ExternalParameters } from './external_parameters';
import { FaciaConnection } from './facia-connection';
import { PersonalisedFronts } from './personalised-fronts';
import { PrintableRecipeGenerator } from './printable-recipe-generator';
import { RecipesReindex } from './recipes-reindex';
import { RestEndpoints } from './rest-endpoints';
import { StaticServing } from './static-serving';

export class RecipesBackend extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const app = 'recipes-responder';
		const serving = new StaticServing(this, 'static');
		const store = new DataStore(this, 'store');

		const lambdaTimeout = Duration.seconds(30);

		new GuLambdaFunction(this, 'testIndexLambda', {
			fileName: 'test-indexbuild-lambda.zip',
			runtime: Runtime.NODEJS_20_X,
			architecture: Architecture.ARM_64,
			app: 'recipes-backend-testindex',
			handler: 'main.handler',
			timeout: lambdaTimeout,
			environment: {
				STATIC_BUCKET: serving.staticBucket.bucketName,
				INDEX_TABLE: store.table.tableName,
				LAST_UPDATED_INDEX: store.lastUpdatedIndexName,
			},
			initialPolicy: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['s3:PutObject', 's3:DeleteObject'],
					resources: [serving.staticBucket.bucketArn + '/*'],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['dynamodb:Scan', 'dynamodb:Query'],
					resources: [store.table.tableArn, store.table.tableArn + '/index/*'],
				}),
			],
		});
		const externalParameters = new ExternalParameters(this, 'externals');
		const nonUrgentAlarmTopic = aws_sns.Topic.fromTopicArn(
			this,
			'nonurgent-alarm',
			externalParameters.nonUrgentAlarmTopicArn.stringValue,
		);

		const capiKeyParam = new GuParameter(this, 'capiKey', {
			fromSSM: true,
			default: `/${this.stage}/${this.stack}/${app}/capi-key`,
		});

		const fastlyKeyParam = new GuParameter(this, 'fastlyKey', {
			fromSSM: true,
			default: `/${this.stage}/${this.stack}/${app}/fastly-key`,
		});

		const telemetryTopic = new GuParameter(this, 'TelemetryTopic', {
			fromSSM: true,
			default: `/${this.stage}/feast/recipe-structuriser/telemetryTopic`,
			description:
				'ARN of the SNS topic to use for data submissions (shared with structuriser)',
		});

		const eventBusParam = new GuParameter(this, 'EventBus', {
			fromSSM: true,
			default: `/${this.stage}/feast/feast-shared-infra/crier-event-bus`,
		});

		const faciaSNSTopicARNParam = new GuParameter(this, 'faciaSNSTopicParam', {
			default: `/${this.stage}/${this.stack}/${app}/facia-sns-topic-arn`,
			fromSSM: true,
			description:
				'The ARN of the facia-tool SNS topic that emits curation notifications',
		});

		const faciaPublishStatusSNSTopicParam = new GuParameter(
			this,
			'faciaPublishStatusSNSTopicParam',
			{
				default: `/${this.stage}/${this.stack}/${app}/facia-status-sns-topic-arn`,
				fromSSM: true,
				type: 'String',
				description:
					'The ARN of the facia-tool SNS topic that receives publication status messages',
			},
		);

		const faciaPublishStatusSNSRoleARNParam = new GuParameter(
			this,
			'faciaPublishStatusSNSTopicRoleParam',
			{
				default: `/${this.stage}/${this.stack}/${app}/facia-status-sns-topic-role-arn`,
				fromSSM: true,
				type: 'String',
				description:
					'The ARN of role that permits us to write to faciaPublishStatusSNSTopic',
			},
		);

		const shouldPublishV2Param = new GuParameter(this, 'ShouldPublishV2', {
			fromSSM: true,
			default: `/${this.stage}/${this.stack}/${app}/should-publish-v2`,
		});

		const reindexBatchSizeParam = new GuParameter(
			this,
			'reindexBatchSizeParam',
			{
				default: 100,
				type: 'Number',
				description: 'The size of the batches to write to the reindex stream',
			},
		);

		const reindexWaitTimeParam = new GuParameter(this, 'reindexWaitTimeParam', {
			default: 10,
			type: 'Number',
			description:
				'The time to wait between sending batches of reindex messages',
		});

		const configBucketParam = new GuParameter(this, 'configBucketParam', {
			default: '/account/services/private.config.bucket',
			fromSSM: true,
			type: 'String',
			description: 'Location of the private config bucket',
		});

		const contentUrlBase =
			this.stage === 'CODE'
				? 'recipes.code.dev-guardianapis.com'
				: 'recipes.guardianapis.com';

		const capiUrlBase =
			this.stage === 'CODE'
				? 'content.code.dev-guardianapis.com'
				: 'content.guardianapis.com';

		const eventBus = EventBus.fromEventBusName(
			this,
			'CrierEventBus',
			eventBusParam.valueAsString,
		);

		const updaterLambda = new GuLambdaFunction(this, 'updaterLambda', {
			functionName: `recipe-responder-${this.stack}-${this.stage}`,
			environment: {
				CAPI_KEY: capiKeyParam.valueAsString,
				INDEX_TABLE: store.table.tableName,
				LAST_UPDATED_INDEX: store.lastUpdatedIndexName,
				CONTENT_URL_BASE: contentUrlBase,
				DEBUG_LOGS: 'true',
				FASTLY_API_KEY: fastlyKeyParam.valueAsString,
				STATIC_BUCKET: serving.staticBucket.bucketName,
				TELEMETRY_TOPIC: telemetryTopic.valueAsString,
				OUTGOING_EVENT_BUS: eventBus.eventBusName,
				CAPI_BASE_URL:
					this.stage === 'PROD'
						? 'https://content.guardianapis.com'
						: 'https://content.code.dev-guardianapis.com',
				SHOULD_PUBLISH_V2: shouldPublishV2Param.valueAsString,
			},
			initialPolicy: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['s3:PutObject', 's3:DeleteObject'],
					resources: [serving.staticBucket.bucketArn + '/*'],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						'dynamodb:Scan',
						'dynamodb:Query',
						'dynamodb:BatchWriteItem',
						'dynamodb:DeleteItem',
						'dynamodb:PutItem',
					],
					resources: [store.table.tableArn, store.table.tableArn + '/index/*'],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					resources: ['*'],
					actions: ['cloudwatch:PutMetricData'],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['events:PutEvents'],
					resources: [eventBus.eventBusArn],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['sns:Publish'],
					resources: [telemetryTopic.valueAsString],
				}),
			],
			runtime: Runtime.NODEJS_20_X,
			app,
			handler: 'main.handler',
			fileName: `${app}.zip`,
			timeout: lambdaTimeout,
		});

		const responderDLQ = new Queue(this, 'RecipeResponderDLQ', {
			queueName: `recipe-responder-${this.stage}-DLQ`,
		});

		new Rule(this, 'CrierConnection', {
			eventBus,
			description: `Connect recipe responder ${this.stage} to Crier`,
			eventPattern: {
				source: ['crier'],
				detail: {
					channels: ['feast'],
				},
			},
			targets: [
				new aws_events_targets.LambdaFunction(updaterLambda, {
					deadLetterQueue: responderDLQ,
					maxEventAge: Duration.minutes(30),
					retryAttempts: 5,
				}),
			],
		});

		new Rule(this, 'ReindexConnection', {
			eventBus,
			description: `Connect recipe responder ${this.stage} to recipes-reindex`,
			eventPattern: {
				source: ['recipes-reindex'],
			},
			targets: [
				new aws_events_targets.LambdaFunction(updaterLambda, {
					deadLetterQueue: responderDLQ,
					maxEventAge: Duration.minutes(30),
					retryAttempts: 5,
				}),
			],
		});

		new FaciaConnection(this, 'RecipesFacia', {
			fastlyKeyParam,
			serving,
			externalParameters,
			faciaPublishSNSTopicARN: faciaSNSTopicARNParam.valueAsString,
			faciaPublishStatusSNSTopicARN:
				faciaPublishStatusSNSTopicParam.valueAsString,
			faciaPublishStatusSNSRoleARN:
				faciaPublishStatusSNSRoleARNParam.valueAsString,
			contentUrlBase,
		});

		new RestEndpoints(this, 'RestEndpoints', {
			servingBucket: serving.staticBucket,
			fastlyKey: fastlyKeyParam.valueAsString,
			contentUrlBase,
			dataStore: store,
		});

		new RecipesReindex(this, 'RecipeReindex', {
			dataStore: store,
			contentUrlBase,
			reindexBatchSize: reindexBatchSizeParam.valueAsNumber,
			reindexWaitTime: reindexWaitTimeParam.valueAsNumber,
			eventBus,
		});

		const durationAlarm = new Alarm(this, 'DurationRuntimeAlarm', {
			alarmDescription:
				'Recipe backend ingest lambda at 75% of allowed duration',
			actionsEnabled: true,
			threshold: lambdaTimeout.toMilliseconds() * 0.75,
			treatMissingData: TreatMissingData.IGNORE,
			comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
			metric: updaterLambda.metricDuration({
				period: Duration.minutes(3),
				statistic: 'Maximum',
				unit: Unit.MILLISECONDS,
			}),
			evaluationPeriods: 3, // when happens at least 3 times
		});

		durationAlarm.addAlarmAction(new SnsAction(nonUrgentAlarmTopic));

		const publishTodaysCurationLambda = new GuScheduledLambda(
			this,
			'PublishTodaysCuration',
			{
				app: 'recipes-publish-todays-curation',
				architecture: Architecture.ARM_64,
				fileName: 'publish-todays-curation.zip',
				functionName: `PublishTodaysCuration-${props.stage}`,
				handler: 'main.handler',
				initialPolicy: [
					new PolicyStatement({
						effect: Effect.DENY,
						actions: ['*'],
						resources: [serving.staticBucket.bucketArn + '/content/*'],
					}),
					new PolicyStatement({
						effect: Effect.ALLOW,
						actions: ['s3:PutObject', 's3:GetObject'],
						resources: [serving.staticBucket.bucketArn + '/*'],
					}),
					new PolicyStatement({
						effect: Effect.ALLOW,
						actions: ['s3:ListBucket'],
						resources: [serving.staticBucket.bucketArn],
					}),
				],
				memorySize: 256,
				monitoringConfiguration: {
					noMonitoring: true,
				},
				rules: [
					{
						schedule: Schedule.cron({ hour: '0', minute: '1' }),
						description: 'Update Feast app daily curation at midnight',
					},
				],
				runtime: Runtime.NODEJS_20_X,
				timeout: Duration.seconds(10),
				environment: {
					STATIC_BUCKET: serving.staticBucket.bucketName,
					FASTLY_API_KEY: fastlyKeyParam.valueAsString,
					CONTENT_URL_BASE: contentUrlBase,
				},
			},
		);

		serving.staticBucket.addObjectCreatedNotification(
			new LambdaDestination(publishTodaysCurationLambda),
			{ suffix: 'curation.json' },
		);

		new GuScheduledLambda(this, 'PublishContributors', {
			app: 'recipes-publish-contributor-information',
			architecture: Architecture.ARM_64,
			fileName: 'profile-cache-rebuild.zip',
			functionName: `PublishRecipeContributors-${this.stage}`,
			handler: 'main.handler',
			initialPolicy: [
				new PolicyStatement({
					effect: Effect.DENY,
					actions: ['*'],
					resources: [serving.staticBucket.bucketArn + '/content/*'],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['s3:PutObject', 's3:GetObject'],
					resources: [serving.staticBucket.bucketArn + '/*'],
				}),
			],
			memorySize: 256,
			monitoringConfiguration: {
				noMonitoring: true, //TBD
			},
			rules: [
				{
					schedule: Schedule.cron({ minute: '16' }),
					description:
						'Update cache of contributor information for Feast at 16 minutes past every hour',
				},
			],
			runtime: Runtime.NODEJS_20_X,
			timeout: Duration.seconds(30),
			environment: {
				STATIC_BUCKET: serving.staticBucket.bucketName,
				FASTLY_API_KEY: fastlyKeyParam.valueAsString,
				CONTENT_URL_BASE: contentUrlBase,
				CAPI_BASE_URL: capiUrlBase,
				CAPI_KEY: capiKeyParam.valueAsString,
			},
		});

		new DynamicFronts(this, 'DynamicFronts', {
			destBucket: serving.staticBucket,
			externalParameters,
		});

		new PersonalisedFronts(this, 'PersonalisedFronts', {
			destBucket: serving.staticBucket,
			externalParameters,
		});

		new PrintableRecipeGenerator(this, 'PrintableRecipes', { eventBus });

		new GuLambdaFunction(this, 'update-densities-lambda', {
			app: 'recipes-backend-update-densities',
			functionName: `update-density-data-${this.stage}`,
			fileName: 'update-density.zip',
			handler: 'main.handler',
			runtime: Runtime.NODEJS_22_X,
			architecture: Architecture.ARM_64,
			environment: {
				FASTLY_API_KEY: fastlyKeyParam.valueAsString,
				STATIC_BUCKET: serving.staticBucket.bucketName,
			},
			initialPolicy: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject'],
					resources: [serving.staticBucket.bucketArn + '/densities/*'],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['s3:GetObject', 's3:DeleteObject'],
					resources: [
						`arn:aws:s3:::${configBucketParam.valueAsString}/densities/*`,
					],
				}),
			],
			memorySize: 256,
			timeout: Duration.seconds(10),
		});
	}
}
