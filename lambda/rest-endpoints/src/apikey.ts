import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { Stage } from './config';

const ssmClient = new SSMClient({ region: process.env['AWS_REGION'] });

export async function getActiveApiKey() {
	const Name = `/${Stage}/feast/recipes-backend/api-push-key`;

	console.log(`Checking ${Name}`);
	const paramContent = await ssmClient.send(
		new GetParameterCommand({
			Name,
			WithDecryption: true,
		}),
	);

	if (paramContent.Parameter) {
		return paramContent.Parameter.Value;
	} else {
		throw new Error(
			`The api push key was not defined, check value for /${Stage}/feast/recipes-backend/api-push-key`,
		);
	}
}

export async function checkAuthorization(authHeader?: string) {
	if (!authHeader) {
		return false;
	}
	const apiKey = await getActiveApiKey();
	return authHeader === apiKey;
}
