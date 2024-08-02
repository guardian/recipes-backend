import * as facia from '@recipes-api/lib/facia';
import { deployCurationData } from '@recipes-api/lib/recipes-data';
import type { SNSMessage, SQSHandler, SQSRecord } from 'aws-lambda';
import format from 'date-fns/format';
import type { SafeParseReturnType } from 'zod';
import { notifyFaciaTool } from './facia-notifications';
import { getErrorMessage } from './util';

function getMessageBodyAsObject(from: SQSRecord): unknown {
	const parsedSNSMessage = JSON.parse(from.body) as SNSMessage; // will throw if the content is not valid;
	const parsedBody = JSON.parse(parsedSNSMessage.Message) as unknown;
	return parsedBody;
}

function parseFeastCurationEnvelope(
	message: unknown,
): SafeParseReturnType<unknown, facia.FeastCurationEnvelope> {
	return facia.FeastCurationEnvelope.safeParse(message);
}

function parseFeastCuration(
	message: unknown,
): SafeParseReturnType<unknown, facia.FeastCuration> {
	return facia.FeastCuration.safeParse(message);
}

async function deployCuration(curation: facia.FeastCuration) {
	const issueDate = new Date(curation.issueDate);
	for (const frontName of Object.keys(curation.fronts)) {
		console.log(
			`Deploying new front for ${frontName} in ${
				curation.edition as string
			} on ${format(issueDate, 'yyyy-MM-dd')}`,
		);
		const serializedFront = JSON.stringify(curation.fronts[frontName]);
		await deployCurationData(
			serializedFront,
			curation.edition,
			frontName,
			issueDate,
		);
	}
}

export const handler: SQSHandler = async (event) => {
	for (const rec of event.Records) {
		console.log(
			`Received message with ID ${rec.messageId}, payload ${rec.body}`,
		);

		//If something fails here, let it crash. The message will get retried and then sent to DLQ
		// by the Lambda runtime and we will continue running
		const messageBody = getMessageBodyAsObject(rec);

		const maybeMessageEnvelope = parseFeastCurationEnvelope(messageBody);
		if (!maybeMessageEnvelope.success) {
			throw new Error(
				`Error parsing message envelope: ${JSON.stringify(
					maybeMessageEnvelope.error,
				)}`,
			);
		}

		const maybeFronts = parseFeastCuration(rec);
		const { edition, issueDate, version } = maybeMessageEnvelope.data;
		if (!maybeFronts.success) {
			return notifyFaciaTool({
				edition,
				issueDate,
				version,
				status: 'Failed',
				message: `Failed to publish this issue. Error: ${JSON.stringify(
					maybeFronts.error,
				)}`,
				timestamp: Date.now(),
			});
		}

		try {
			await deployCuration(maybeFronts.data);

			return notifyFaciaTool({
				edition,
				issueDate,
				version,
				status: 'Published',
				message: 'This issue has been published',
				timestamp: Date.now(),
			});
		} catch (e) {
			return notifyFaciaTool({
				edition,
				issueDate,
				version,
				status: 'Failed',
				message: `Failed to publish this issue. Error: ${getErrorMessage(e)}`,
				timestamp: Date.now(),
			});
		}
	}
};
