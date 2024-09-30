import * as process from 'process';

export const StaticBucketName = mandatoryParam('STATIC_BUCKET');
export const FastlyApiKey = mandatoryParam('FASTLY_API_KEY');

function mandatoryParam(paramName: string): string {
	if (process.env[paramName]) {
		return process.env[paramName] as string;
	} else {
		throw new Error(`You must specify ${paramName} in the environment`);
	}
}
