import type { SNSMessage, SQSHandler, SQSRecord } from 'aws-lambda';
import format from 'date-fns/format';
import type { SafeParseReturnType } from 'zod';
import * as facia from '@recipes-api/lib/facia';
import { deployCurationData } from '@recipes-api/lib/recipes-data';
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
	const region = curation.path ?? curation.edition;
	for (const frontName of Object.keys(curation.fronts)) {
		console.log(
			`Deploying new front for ${frontName} in ${region} on ${format(
				issueDate,
				'yyyy-MM-dd',
			)}`,
		);
		const serializedFront = JSON.stringify(curation.fronts[frontName]);
		await deployCurationData(serializedFront, region, frontName, issueDate);
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

		// We parse the message in two phases, first extracting the message envelope,
		// and then the fronts data. In this way, if extracting the fronts data fails,
		// we can use the envelope data to post the error message back to the Fronts tool.
		const maybeMessageEnvelope = parseFeastCurationEnvelope(messageBody);
		if (!maybeMessageEnvelope.success) {
			throw new Error(
				`Error parsing message envelope: ${JSON.stringify(
					maybeMessageEnvelope.error,
				)}`,
			);
		}

		const { edition, issueDate, version } = maybeMessageEnvelope.data;

		const maybeFronts = parseFeastCuration(messageBody);

		if (!maybeFronts.success) {
			console.error(maybeFronts.error);
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
			console.error(e);
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
