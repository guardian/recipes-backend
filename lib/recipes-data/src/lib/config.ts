//Used by dynamo.ts
export const indexTableName = process.env["INDEX_TABLE"]
export const lastUpdatedIndex = process.env["LAST_UPDATED_INDEX"]

//Used by fastly.ts
const UrlPrefix = /^http(s)?:\/\//;
export const ContentUrlBase = process.env["CONTENT_URL_BASE"];
export const ContentPrefix = ContentUrlBase ? ContentUrlBase.replace(UrlPrefix, "") : undefined;
export const DebugLogsEnabled = process.env["DEBUG_LOGS"] ? process.env["DEBUG_LOGS"].toLowerCase()==="true" : false;
export const MaximumRetries = process.env["MAX_RETRIES"] ? parseInt(process.env["MAX_RETRIES"]) : 10;
export const RetryDelaySeconds = process.env["RETRY_DELAY"] ? parseInt(process.env["RETRY_DELAY"]) : 1;
