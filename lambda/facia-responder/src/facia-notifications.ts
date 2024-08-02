import { SNS } from '@aws-sdk/client-sns';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import {
	faciaPublicationStatusRoleArn,
	faciaPublicationStatusTopicArn,
} from './config';

// The publication status event we send over SNS.
type PublicationStatusEventEnvelope = {
	event: PublicationStatusEvent;
};

export type PublicationStatusEvent = {
	edition: string;
	issueDate: string;
	version: string;
	status:
		| 'Started'
		| 'Proofing'
		| 'Proofed'
		| 'Publishing'
		| 'Published'
		| 'Failed'
		| 'PostProcessing';
	message: string;
	timestamp: number;
};

export async function notifyFaciaTool(
	event: PublicationStatusEvent,
): Promise<void> {
	const payload = JSON.stringify({ event } as PublicationStatusEventEnvelope);

	console.log(
		`Publishing publish event to SNS: ${payload} to ${faciaPublicationStatusTopicArn} via ${faciaPublicationStatusRoleArn}`,
	);

	const sns = new SNS({
		region: 'eu-west-1',
		credentials: fromTemporaryCredentials({
			params: {
				RoleArn: faciaPublicationStatusRoleArn,
				RoleSessionName: 'recipes-backend-assume-role-access-for-sns',
			},
		}),
	});

	const sendStatus = await sns.publish({
		TopicArn: faciaPublicationStatusTopicArn,
		Message: payload,
	});

	console.log(`SNS status publish response: ${JSON.stringify(sendStatus)}`);
}
