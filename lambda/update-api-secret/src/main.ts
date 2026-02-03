import { PutParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { Stage } from './config';
import crypto from 'crypto';

const ssmClient = new SSMClient({region: process.env["REGION"]});

export const handler = async () => {
	const Name = `/${Stage}/feast/recipes-backend/api-push-key`;

	const trailingEq = /=+$/;

	const newKey = crypto.randomBytes(12).toString('base64').replace(trailingEq, '');

	const response = await ssmClient.send(new PutParameterCommand({
		Name,
		Value: newKey,
		Type: "SecureString",
		Overwrite: true,
	}));

	console.log(`Updated api-push key, version is now ${response.Version}`);
}
