import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { getErrorMessage } from './util';

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
	faciaPublicationStatusTopicArn: string,
	faciaPublicationStatusRoleArn: string,
): Promise<void> {
	const payload = JSON.stringify({ event } as PublicationStatusEventEnvelope);

	console.log(
		`Publishing publish event to SNS: ${payload} to ${faciaPublicationStatusTopicArn} via ${faciaPublicationStatusRoleArn}`,
	);

	const sns = new SNSClient({
		region: 'eu-west-1',
		credentials: fromTemporaryCredentials({
			params: {
				RoleArn: faciaPublicationStatusRoleArn,
				RoleSessionName: 'recipes-backend-assume-role-access-for-sns',
			},
		}),
	});

	try {
		const sendStatus = await sns.send(
			new PublishCommand({
				TopicArn: faciaPublicationStatusTopicArn,
				Message: payload,
			}),
		);

		console.log(`SNS status publish response: ${JSON.stringify(sendStatus)}`);
	} catch (e) {
		console.error(`Failed to publish to SNS: ${getErrorMessage(e)}`);
	}
}
