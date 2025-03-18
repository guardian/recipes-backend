import * as process from 'process';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { TelemetryTopic } from './config';

const maxAttempts = 3;

const snsClient = new SNSClient({
	region: process.env['AWS_REGION'],
});

type EventType =
	| 'IncomingHTML'
	| 'CleanedText'
	| 'CleanedHTML'
	| 'StructuredData'
	| 'Metadata'
	| 'PublishedData'
	| 'TakenDown';

async function smallDelay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendTelemetryEvent(
	eventId: EventType,
	recipeId: string,
	jsonString: string,
	attempt?: number,
) {
	if (!TelemetryTopic) {
		console.error('You must configure TELEMETRY_TOPIC to enable telemetry.');
		return;
	}

	try {
		const req = new PublishCommand({
			TopicArn: TelemetryTopic,
			Message: jsonString,
			MessageAttributes: {
				recipeId: { DataType: 'String', StringValue: recipeId },
				Event: { DataType: 'String', StringValue: eventId },
			},
		});
		const response = await snsClient.send(req);
		console.log(
			`Telemetry message for ${eventId} send with message ID ${
				response.MessageId ?? '(not defined)'
			}`,
		);
	} catch (err) {
		const typeofErr = typeof err;
		console.error(`sendEvent caught ${typeofErr}: ${JSON.stringify(err)}`);
		const realAttempt = attempt ?? 1;
		if (realAttempt < maxAttempts) {
			console.log('Trying again');
			await smallDelay(500);
			return sendTelemetryEvent(eventId, recipeId, jsonString, realAttempt + 1);
		} else {
			console.error('Ran out of retries');
			//don't re-throw the error, because we want to ensure publication works anyway.
		}
	}
}
