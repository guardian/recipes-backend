import type {GuParameter, GuStack} from "@guardian/cdk/lib/constructs/core";
import {GuLambdaFunction} from "@guardian/cdk/lib/constructs/lambda";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Architecture, Runtime} from "aws-cdk-lib/aws-lambda";
import {SqsEventSource} from "aws-cdk-lib/aws-lambda-event-sources";
import {Queue} from "aws-cdk-lib/aws-sqs";
import {Construct} from "constructs";
import type {ExternalParameters} from "./external_parameters";
import type {StaticServing} from "./static-serving";
import {Duration} from "aws-cdk-lib";

interface FaciaConnectionProps {
  fastlyKeyParam: GuParameter;
  serving: StaticServing;
  externalParameters:ExternalParameters;
}

export class FaciaConnection extends Construct {
  constructor(scope:GuStack, id:string, props:FaciaConnectionProps) {
    super(scope, id);

    const faciaQueue = new Queue(this, "Connection", {
      enforceSSL: true,
    });

    const faciaDLQ = new Queue(this, "DLQ");

    new GuLambdaFunction(scope, "RecipesFaciaResponder", {
      events: [
        new SqsEventSource(faciaQueue, {
          batchSize: 1, //we are not expecting heavy traffic so just invoke as the records arrive, one-by-one
          maxConcurrency: 5,
        })
      ],
      errorPercentageMonitoring: {
        toleratedErrorPercentage: 1,
        snsTopicName: props.externalParameters.nonUrgentAlarmTopicArn.stringValue,
      },
      app: "recipes-facia-responder",
      architecture: Architecture.ARM_64,
      deadLetterQueue: faciaDLQ,
      environment: {
        FASTLY_API_KEY: props.fastlyKeyParam.valueAsString,
        STATIC_BUCKET: props.serving.staticBucket.bucketName,
      },
      fileName: "facia-responder.zip",
      functionName: `RecipesFaciaResponder-${scope.stage}`,
      handler: "main.handler",
      initialPolicy: [
        new PolicyStatement({
          effect: Effect.DENY,
          resources: [
            props.serving.staticBucket.bucketArn + "/content/*",
            props.serving.staticBucket.bucketArn + "/index.json"
          ],
          actions: ["s3:*"]
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          resources: [props.serving.staticBucket.bucketArn + "/*"],
          actions: ["s3:PutObject", "s3:ListObjects"]
        })
      ],
      memorySize: 256,
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10)
    });
  }
}
