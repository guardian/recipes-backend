import type {GuStackProps} from "@guardian/cdk/lib/constructs/core";
import {GuParameter, GuStack} from "@guardian/cdk/lib/constructs/core";
import {GuLambdaFunction} from "@guardian/cdk/lib/constructs/lambda";
import {GuKinesisLambdaExperimental} from "@guardian/cdk/lib/experimental/patterns";
import {StreamRetry} from "@guardian/cdk/lib/utils/lambda";
import {type App, aws_sns, Duration} from "aws-cdk-lib";
import {Alarm, ComparisonOperator, TreatMissingData, Unit} from "aws-cdk-lib/aws-cloudwatch";
import {SnsAction} from "aws-cdk-lib/aws-cloudwatch-actions";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Architecture, Runtime} from "aws-cdk-lib/aws-lambda";
import {DataStore} from "./datastore";
import {RestEndpoints} from "./rest-endpoints";
import {ExternalParameters} from "./external_parameters";
import {StaticServing} from "./static-serving";

export class RecipesBackend extends GuStack {
  constructor(scope: App, id: string, props: GuStackProps) {
    super(scope, id, props);

    const serving = new StaticServing(this, "static");
    const store = new DataStore(this, "store");

    new GuLambdaFunction(this, "testIndexLambda", {
      fileName: "test-indexbuild-lambda.zip",
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      app: "recipes-backend-testindex",
      handler: "main.handler",
      timeout: Duration.seconds(60),
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
      ],
      runtime: Runtime.NODEJS_18_X,
      app: "recipes-responder",
      handler: "main.handler",
      fileName: "recipes-responder.zip",
      timeout: Duration.seconds(30)
    });

    new RestEndpoints(this, "RestEndpoints", {
      servingBucket: serving.staticBucket,
      fastlyKey: fastlyKeyParam.valueAsString,
      contentUrlBase,
    });

    const durationAlarm = new Alarm(this, "DurationRuntimeAlarm", {
      alarmDescription: "Notify when the lambda exceeds 75%",
      actionsEnabled: true,
      threshold: 22500, //in milliseconds which means 22.5 seconds (which is 75% near to 30 seconds timout of lambda)
      treatMissingData: TreatMissingData.IGNORE,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      metric: updaterLambda.metricDuration({
        period: Duration.minutes(1),
        statistic: "Average",
        unit: Unit.MILLISECONDS// "percent" as we are tyring to use 75 "%" to check against threshold, TODO: Need to check this if it should be Unit.milliseconds to see time wise?
      }),
      evaluationPeriods: 3,// when happens atleast 3 times
    })

    const externalParameters = new ExternalParameters(this, "externals");
    const urgentAlarmTopic = aws_sns.Topic.fromTopicArn(this, "urgent-alarm", externalParameters.urgentAlarmTopicArn.stringValue);
    //const nonUrgentAlarmTopic = aws_sns.Topic.fromTopicArn(this, "nonurgent-alarm", externalParameters.nonUrgentAlarmTopicArn.stringValue);
    durationAlarm.addAlarmAction(new SnsAction(urgentAlarmTopic))
  }

}
