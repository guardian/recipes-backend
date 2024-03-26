//Used by dynamo.ts
import * as process from "process";

export const indexTableName = process.env["INDEX_TABLE"]
export const lastUpdatedIndex = process.env["LAST_UPDATED_INDEX"]

//Used by fastly.ts
const UrlPrefix = /^http(s)?:\/\//;
export const ContentUrlBase = mandatoryParameter("CONTENT_URL_BASE");
export const ContentPrefix = ContentUrlBase ? ContentUrlBase.replace(UrlPrefix, "") : undefined;
export const DebugLogsEnabled = process.env["DEBUG_LOGS"] ? process.env["DEBUG_LOGS"].toLowerCase()==="true" : false;
export const MaximumRetries = process.env["MAX_RETRIES"] ? parseInt(process.env["MAX_RETRIES"]) : 10;
export const RetryDelaySeconds = process.env["RETRY_DELAY"] ? parseInt(process.env["RETRY_DELAY"]) : 1;
export const FastlyApiKey = process.env["FASTLY_API_KEY"];

//Used by s3.ts
export const StaticBucketName = mandatoryParameter("STATIC_BUCKET");

function mandatoryParameter(name:string):string {
  if(process.env[name]) {
    return process.env[name] as string;
  } else {
    throw new Error(`You need to define the environment variable ${name} in the lambda config`)
  }
}

//Used by telemetry
export const TelemetryXAR = process.env["TELEMETRY_XAR"]
export const TelemetryTopic = process.env["TELEMETRY_TOPIC"]

//Used by content transforms
export const PREVIEW_IMAGE_WIDTH = process.env["PREVIEW_IMAGE_WIDTH"] ? parseInt(process.env["PREVIEW_IMAGE_WIDTH"]) : 300;
export const FEATURED_IMAGE_WIDTH = process.env["FEATURED_IMAGE_WIDTH"] ? parseInt(process.env["FEATURED_IMAGE_WIDTH"]) : 700;
export const IMAGE_DPR = process.env["IMAGE_DPR"] ? parseInt(process.env["IMAGE_DPR"]) : 700;
