import * as facia from '@recipes-api/lib/facia';
import { deployCurationData } from '@recipes-api/lib/recipes-data';
import type { SNSMessage, SQSHandler, SQSRecord } from 'aws-lambda';
import format from 'date-fns/format';
import { notifyFaciaTool } from './facia-notifications';
import { getErrorMessage } from './util';

function parseMesssage(from: SQSRecord): facia.FeastCuration {
	const parsedSNSMessage = JSON.parse(from.body) as SNSMessage; // will throw if the content is not valid;
	const parsedBody = JSON.parse(parsedSNSMessage.Message) as unknown;
	return facia.FeastCuration.parse(parsedBody);
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
		const newCuration = parseMesssage(rec);

		try {
			await deployCuration(newCuration);
		} catch (e) {
			void notifyFaciaTool({
				edition: newCuration.edition,
				issueDate: newCuration.issueDate,
				version: newCuration.version,
				status: 'Failed',
				message: `Failed to publish this issue. Error: ${getErrorMessage(e)}`,
				timestamp: Date.now(),
			});
		}

		void notifyFaciaTool({
			edition: newCuration.edition,
			issueDate: newCuration.issueDate,
			version: newCuration.version,
			status: 'Published',
			message: 'This issue has been published',
			timestamp: Date.now(),
		});
	}
};
