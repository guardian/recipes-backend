import {GuApiLambda} from "@guardian/cdk";
import type {GuStack} from "@guardian/cdk/lib/constructs/core";
import {Duration} from "aws-cdk-lib";
import {ApiKeySourceType, EndpointType} from "aws-cdk-lib/aws-apigateway";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Architecture, Runtime} from "aws-cdk-lib/aws-lambda";
import type {IBucket} from "aws-cdk-lib/aws-s3";
import {Construct} from "constructs";

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
        endpointTypes: [EndpointType.REGIONAL],
        defaultMethodOptions: {
          apiKeyRequired: true,
        }
      },
      app: "recipes-backend-rest-endpoints",
      architecture: Architecture.ARM_64,
      description: "REST API endpoints for the recipe backend",
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
      apiStages: [
        {
          stage: apiConstruct.api.deploymentStage,
          api: apiConstruct.api,
        }
      ]
    });
  }
}
