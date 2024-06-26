import {GuScheduledLambda} from "@guardian/cdk";
import type {GuStackProps} from "@guardian/cdk/lib/constructs/core";
import {GuParameter, GuStack} from "@guardian/cdk/lib/constructs/core";
import {GuLambdaFunction} from "@guardian/cdk/lib/constructs/lambda";
import {GuKinesisLambdaExperimental} from "@guardian/cdk/lib/experimental/patterns";
import {StreamRetry} from "@guardian/cdk/lib/utils/lambda";
import {type App, aws_sns, Duration} from "aws-cdk-lib";
import {Alarm, ComparisonOperator, TreatMissingData, Unit} from "aws-cdk-lib/aws-cloudwatch";
import {SnsAction} from "aws-cdk-lib/aws-cloudwatch-actions";
import {Schedule} from "aws-cdk-lib/aws-events";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Architecture, Runtime} from "aws-cdk-lib/aws-lambda";
import {LambdaDestination} from "aws-cdk-lib/aws-s3-notifications";
import {DataStore} from "./datastore";
import {ExternalParameters} from "./external_parameters";
import {RestEndpoints} from "./rest-endpoints";
import {StaticServing} from "./static-serving";

export class RecipesBackend extends GuStack {
  constructor(scope: App, id: string, props: GuStackProps) {
    super(scope, id, props);

    const serving = new StaticServing(this, "static");
    const store = new DataStore(this, "store");

    const lambdaTimeout = Duration.seconds(30);

    new GuLambdaFunction(this, "testIndexLambda", {
      fileName: "test-indexbuild-lambda.zip",
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      app: "recipes-backend-testindex",
      handler: "main.handler",
      timeout: lambdaTimeout,
      environment: {
        STATIC_BUCKET: serving.staticBucket.bucketName,
        INDEX_TABLE: store.table.tableName,
        LAST_UPDATED_INDEX: store.lastUpdatedIndexName,
      },
      initialPolicy: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["s3:PutObject", "s3:DeleteObject"],
          resources: [serving.staticBucket.bucketArn + "/*"]
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["dynamodb:Scan", "dynamodb:Query"],
          resources: [store.table.tableArn, store.table.tableArn + "/index/*"]
        })
      ]
    });
    const externalParameters = new ExternalParameters(this, "externals");
    const nonUrgentAlarmTopic = aws_sns.Topic.fromTopicArn(this, "nonurgent-alarm", externalParameters.nonUrgentAlarmTopicArn.stringValue);

    //This is a nicer way to pick up the stream name - but CDK won't compile
    //when using the name token for the kinesis stream name below.

    // const crierStreamParam = new GuParameter(this, "crierStream", {
    //   default: `/${this.stage}/${this.stack}/crier/index-stream`,
    //   fromSSM: true,
    //   description: "SSM path to the name of the Crier stream we are attaching to"
    // });

    const capiKeyParam = new GuParameter(this, "capiKey", {
      fromSSM: true,
      default: `/${this.stage}/${this.stack}/recipes-responder/capi-key`
    })

    const fastlyKeyParam = new GuParameter(this, "fastlyKey", {
      fromSSM: true,
      default: `/${this.stage}/${this.stack}/recipes-responder/fastly-key`
    })

    const telemetryXAR = new GuParameter(this, "TelemetryCrossAcctRole", {
      fromSSM: true,
      default: `/${this.stage}/${this.stack}/recipes-responder/telemetryXAR`,
      description: "Cross-account role to allow data submissions"
    });
    const telemetryTopic = new GuParameter(this, "TelemetryTopic", {
      fromSSM: true,
      default: `/${this.stage}/${this.stack}/recipes-responder/telemetryTopic`,
      description: "ARN of the SNS topic to use for data submissions"
    });

    const contentUrlBase = this.stage === "CODE" ? "recipes.code.dev-guardianapis.com" : "recipes.guardianapis.com";

    const updaterLambda = new GuKinesisLambdaExperimental(this, "updaterLambda", {
      monitoringConfiguration: {noMonitoring: true},
      existingKinesisStream: {
        externalKinesisStreamName: `content-api-firehose-v2-${this.stage}`,
      },
      errorHandlingConfiguration: {
        retryBehaviour: StreamRetry.maxAttempts(5),
        bisectBatchOnError: true,
      },
      environment: {
        CAPI_KEY: capiKeyParam.valueAsString,
        INDEX_TABLE: store.table.tableName,
        LAST_UPDATED_INDEX: store.lastUpdatedIndexName,
        CONTENT_URL_BASE: contentUrlBase,
        DEBUG_LOGS: "true",
        FASTLY_API_KEY: fastlyKeyParam.valueAsString,
        STATIC_BUCKET: serving.staticBucket.bucketName,
        TELEMETRY_XAR: telemetryXAR.valueAsString,
        TELEMETRY_TOPIC: telemetryTopic.valueAsString,
      },
      initialPolicy: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["s3:PutObject", "s3:DeleteObject"],
          resources: [serving.staticBucket.bucketArn + "/*"]
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["dynamodb:Scan", "dynamodb:Query", "dynamodb:BatchWriteItem", "dynamodb:DeleteItem", "dynamodb:PutItem"],
          resources: [store.table.tableArn, store.table.tableArn + "/index/*"]
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          resources: ["*"],
          actions: ["cloudwatch:PutMetricData"]
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["sts:AssumeRole"],
          resources: [telemetryXAR.valueAsString]
        })
      ],
      runtime: Runtime.NODEJS_18_X,
      app: "recipes-responder",
      handler: "main.handler",
      fileName: "recipes-responder.zip",
      timeout: lambdaTimeout
    });

    new RestEndpoints(this, "RestEndpoints", {
      servingBucket: serving.staticBucket,
      fastlyKey: fastlyKeyParam.valueAsString,
      contentUrlBase,
      dataStore: store,
    });

    const durationAlarm = new Alarm(this, "DurationRuntimeAlarm", {
      alarmDescription: "Recipe backend ingest lambda at 75% of allowed duration",
      actionsEnabled: true,
      threshold: lambdaTimeout.toMilliseconds() * 0.75,
      treatMissingData: TreatMissingData.IGNORE,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      metric: updaterLambda.metricDuration({
        period: Duration.minutes(3),
        statistic: "Maximum",
        unit: Unit.MILLISECONDS
      }),
      evaluationPeriods: 3,// when happens at least 3 times
    })

    durationAlarm.addAlarmAction(new SnsAction(nonUrgentAlarmTopic));

    const publishTodaysCurationLambda = new GuScheduledLambda(this, "PublishTodaysCuration", {
      app: "recipes-publish-todays-curation",
      architecture: Architecture.ARM_64,
      fileName: "publish-todays-curation.zip",
      functionName: `PublishTodaysCuration-${props.stage}`,
      handler: "main.handler",
      initialPolicy: [
        new PolicyStatement({
          effect: Effect.DENY,
          actions: ["*"],
          resources: [serving.staticBucket.bucketArn + "/content/*"]
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["s3:PutObject","s3:GetObject"],
          resources: [serving.staticBucket.bucketArn + "/*"]
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["s3:ListBucket"],
          resources: [serving.staticBucket.bucketArn]
        })
      ],
      memorySize: 256,
      monitoringConfiguration: {
        noMonitoring: true,
      },
      rules: [{
        schedule: Schedule.cron({hour: "0", minute: "1"}),
        description: "Update Feast app daily curation at midnight"
      }],
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment: {
        STATIC_BUCKET: serving.staticBucket.bucketName,
        FASTLY_API_KEY: fastlyKeyParam.valueAsString,
        CONTENT_URL_BASE: contentUrlBase,
      }
    });

    serving.staticBucket.addObjectCreatedNotification(
      new LambdaDestination(publishTodaysCurationLambda),
      { suffix: "curation.json", }
    );
  }

}
