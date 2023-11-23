import {Construct} from "constructs";
import {GuStack} from "@guardian/cdk/lib/constructs/core";
import {GuApiLambda} from "@guardian/cdk";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {Duration} from "aws-cdk-lib";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {IBucket} from "aws-cdk-lib/aws-s3";
import {ApiKeySourceType} from "aws-cdk-lib/aws-apigateway";

interface RestEndpointsProps {
  servingBucket: IBucket;
  fastlyKey: string;
  contentUrlBase: string;
}

export class RestEndpoints extends Construct {
  constructor(scope:GuStack, id:string, props:RestEndpointsProps) {
    super(scope, id);

    const {
      servingBucket,
      fastlyKey,
      contentUrlBase
    } = props;

    const apiConstruct = new GuApiLambda(scope, "Lambda", {
      api: {
        id: `recipes-backend-${scope.stage}`,
        apiKeySourceType: ApiKeySourceType.HEADER,
        defaultMethodOptions: {
          apiKeyRequired: true,
        }
      },
      app: "recipes-backend-rest-endpoints",
      architecture: undefined,
      description: "",
      environment: {
        STATIC_BUCKET: servingBucket.bucketName,
        FASTLY_API_KEY: fastlyKey,
        CONTENT_URL_BASE: contentUrlBase,
      },
      fileName: "rest-endpoints.zip",
      functionName: `recipes-backend-rest-endpoints-${scope.stage}`,
      handler: "main.handler",
      memorySize: 128,
      monitoringConfiguration: {noMonitoring: true},  //for the time being
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(30),
      initialPolicy: [new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3:PutObject"],
        resources: [`${servingBucket.bucketArn}/curation.json`]
      })]
    });

    apiConstruct.api.addUsagePlan("UsagePlan", {
      name: `recipes-backend-${scope.stage}`,
      description: "REST endpoints for recipes backend",
    });
  }
}
