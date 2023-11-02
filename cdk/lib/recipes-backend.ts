import type { GuStackProps } from "@guardian/cdk/lib/constructs/core";
import { GuStack } from "@guardian/cdk/lib/constructs/core";
// import {GuKinesisLambdaExperimental} from "@guardian/cdk/lib/experimental/patterns";
// import { StreamRetry } from "@guardian/cdk/lib/utils/lambda";
// import { Duration, type App } from "aws-cdk-lib";
// import { Runtime } from "aws-cdk-lib/aws-lambda";
import type { App } from "aws-cdk-lib";
import { DataStore } from "./datastore";
import { StaticServing } from "./static-serving";

export class RecipesBackend extends GuStack {
  constructor(scope: App, id: string, props: GuStackProps) {
    super(scope, id, props);

    //const app = this.app ?? "recipes-backend";

    new StaticServing(this, "static");

    new DataStore(this, "store");

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
