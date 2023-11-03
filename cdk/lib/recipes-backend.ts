import type {GuStackProps} from "@guardian/cdk/lib/constructs/core";
import {GuStack} from "@guardian/cdk/lib/constructs/core";
// import {GuKinesisLambdaExperimental} from "@guardian/cdk/lib/experimental/patterns";
// import { StreamRetry } from "@guardian/cdk/lib/utils/lambda";
import {GuLambdaFunction} from "@guardian/cdk/lib/constructs/lambda";
import {type App, Duration} from "aws-cdk-lib";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Architecture, Runtime} from "aws-cdk-lib/aws-lambda";
import {DataStore} from "./datastore";
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

    //TODO - this is how we can simply connect to an existing kinesis stream. But we have nothing to
    //connect to it yet! - this will be uncommented once we do.

    // new GuKinesisLambdaExperimental(this, "updaterLambda", {
    //   monitoringConfiguration: {noMonitoring: true},
    //   existingKinesisStream: {
    //     externalKinesisStreamName: "blah"
    //   },
    //   errorHandlingConfiguration: {
    //     retryBehaviour: StreamRetry.maxAttempts(5),
    //     bisectBatchOnError: true,
    //   },
    //   runtime: Runtime.NODEJS_18_X,
    //   app,
    //   handler: "main.handler",
    //   fileName: "recipe-backend-updater.zip",
    //   timeout: Duration.seconds(30)
    // })
  }
}
