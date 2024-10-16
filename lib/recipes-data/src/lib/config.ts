//Used by dynamo.ts
import * as process from 'process';

export const indexTableName = process.env['INDEX_TABLE'];
export const lastUpdatedIndex = process.env['LAST_UPDATED_INDEX'];

//Used by fastly.ts
const UrlPrefix = /^http(s)?:\/\//;
export const ContentUrlBase = mandatoryParameter('CONTENT_URL_BASE');
export const ContentPrefix = ContentUrlBase
	? ContentUrlBase.replace(UrlPrefix, '')
	: undefined;
export const DebugLogsEnabled = process.env['DEBUG_LOGS']
	? process.env['DEBUG_LOGS'].toLowerCase() === 'true'
	: false;
export const MaximumRetries = process.env['MAX_RETRIES']
	? parseInt(process.env['MAX_RETRIES'])
	: 10;
export const RetryDelaySeconds = process.env['RETRY_DELAY']
	? parseInt(process.env['RETRY_DELAY'])
	: 1;
export const FastlyApiKey = process.env['FASTLY_API_KEY'];

//Used by s3.ts
export const StaticBucketName = mandatoryParameter('STATIC_BUCKET');

export function mandatoryParameter(name: string): string {
	if (process.env[name]) {
		return process.env[name] as string;
	} else {
		if (process.env['CI']) {
			return 'test';
		} else {
			throw new Error(
				`You need to define the environment variable ${name} in the lambda config`,
			);
		}
	}
}

//Used by telemetry
export const TelemetryXAR = process.env['TELEMETRY_XAR'];
export const TelemetryTopic = process.env['TELEMETRY_TOPIC'];

//Used by content transforms
export const PreviewImageWidth = process.env['PREVIEW_IMAGE_WIDTH']
	? parseInt(process.env['PREVIEW_IMAGE_WIDTH'])
	: 1600;
export const FeaturedImageWidth = process.env['FEATURED_IMAGE_WIDTH']
	? parseInt(process.env['FEATURED_IMAGE_WIDTH'])
	: 1600;
export const ImageDpr = process.env['IMAGE_DPR']
	? parseInt(process.env['IMAGE_DPR'])
	: 1;

//Used by eventbus
export const OutgoingEventBus = process.env['OUTGOING_EVENT_BUS'];
