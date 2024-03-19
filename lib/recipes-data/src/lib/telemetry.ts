import * as process from "process";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";
import type { Credentials as STSCredentials } from "@aws-sdk/client-sts";
import {AssumeRoleCommand, STSClient} from "@aws-sdk/client-sts";
import type { AwsCredentialIdentity } from "@aws-sdk/types";
import {TelemetryTopic, TelemetryXAR} from "./config";

const stsClient = new STSClient({region: process.env["AWS_REGION"]});
const maxAttempts = 3;

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

async function smallDelay(ms:number):Promise<void> {
  return new Promise((resolve)=>setTimeout(resolve,ms));
}

export async function sendTelemetryEvent(eventId:EventType, recipeId:string, jsonString:string, attempt?: number) {
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
    const realAttempt = attempt ?? 1;
    if(realAttempt < maxAttempts) {
      console.log("Refreshing credentials and trying again");
      await smallDelay(500);
      cachedCredentials = await refreshCredentials();
      return sendTelemetryEvent(eventId, recipeId, jsonString, realAttempt+1);
    } else {
      console.error("Ran out of retries");
      //don't re-throw the error, because we want to ensure publication works anyway.
    }
  }
}
