import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({ region: process.env['AWS_REGION'] });

export interface ConfigData {
	workloadFederationConfig: unknown; //opaque json object
	app: string;
	stack: string;
	stage: string;
}

export async function loadConfig(): Promise<ConfigData> {
	const app = process.env['APP'] ?? 'personalised-fronts-fetcher';
	const stack = process.env['STACK'] ?? 'feast';
	const stage = process.env['STAGE'] ?? 'DEV';

	console.log(`loadConfig: app=${app} stack=${stack} stage=${stage}`);
	const response = await ssmClient.send(
		new GetParameterCommand({
			Name: `/${stage}/${stack}/${app}/googleAuthConfig`,
			WithDecryption: true,
		}),
	);

	if (!response.Parameter?.Value) {
		throw new Error('SSM did not return any config parameter');
	} else {
		return {
			workloadFederationConfig: JSON.parse(response.Parameter.Value),
			app,
			stack,
			stage,
		};
	}
}
