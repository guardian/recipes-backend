import * as process from "process";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";
import type { Credentials as STSCredentials } from "@aws-sdk/client-sts";
import {AssumeRoleCommand, STSClient} from "@aws-sdk/client-sts";
import type { AwsCredentialIdentity } from "@aws-sdk/types";
import {TelemetryTopic, TelemetryXAR} from "./config";

const stsClient = new STSClient({region: process.env["AWS_REGION"]});

let cachedCredentials:STSCredentials|undefined;

type EventType = "IncomingHTML"|"CleanedText"|"CleanedHTML"|"StructuredData"|"Metadata"|"PublishedData"|"TakenDown";

async function refreshCredentials() {
  console.log("Refreshing cross-account credentials for telemetry")
  const req = new AssumeRoleCommand({
    DurationSeconds: 900, //900 seconds is the minumum duration
    RoleArn: TelemetryXAR,
    RoleSessionName: "RecipeBackend"
  });
  const response = await stsClient.send(req);
  if(response.Credentials) {
    return response.Credentials;
  } else {
    throw new Error("We received no error, but got no credentials either!")
  }
}

export async function sendTelemetryEvent(eventId:EventType, recipeId:string, jsonString:string) {
  if(!TelemetryXAR || !TelemetryTopic) {
    console.error("You must configure TELEMETRY_XAR and TELEMETRY_TOPIC to enable telemetry.");
    return
  }

  if(!cachedCredentials) {
    cachedCredentials = await refreshCredentials();
  }

  const credentials:AwsCredentialIdentity = {
    accessKeyId: cachedCredentials.AccessKeyId ?? "",  //This is safe, because the if() branch above ensures that AccessKeyId is defined.
    secretAccessKey: cachedCredentials.SecretAccessKey ?? "",
    sessionToken: cachedCredentials.SessionToken
  }

  try {
    console.log("SNS temporary credentials: ", credentials);
    const snsClient = new SNSClient({
      credentials,
      region: process.env["AWS_REGION"]
    });

    const req = new PublishCommand({
      TopicArn: TelemetryTopic,
      Message: jsonString,
      MessageAttributes: {
        recipeId: {DataType: "String", StringValue: recipeId},
        Event: {DataType: "String", StringValue: eventId}
      }
    });
    const response = await snsClient.send(req);
    console.log(`Telemetry message for ${eventId} send with message ID ${response.MessageId ?? "(not defined)"}`);

  } catch(err) {
    const typeofErr = typeof err;
    console.error(`sendEvent caught ${typeofErr}: ${JSON.stringify(err)}`);
  }
}
