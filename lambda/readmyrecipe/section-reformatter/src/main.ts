import * as fs from 'node:fs';
import type { EventBridgeHandler } from 'aws-lambda';
import { paraphraseDescription, paraphraseRecipeSteps } from './bedrock';
import { PartialRecipeModel } from './models';

//TODO should be made common with the generating code
interface IncomingMessageTypeUpdated {
	blob: string;
	uid: string;
	checksum: string;
}

interface IncomingMessageTypeRemoved {
	checksum: string;
	uid: string;
}

interface OutgoingMessage {
	newDescription: string;
	newInstructions: string[];
}

type IncomingMessageType =
	| IncomingMessageTypeUpdated
	| IncomingMessageTypeRemoved;

export const handler: EventBridgeHandler<
	string,
	IncomingMessageType,
	OutgoingMessage
> = async (evt) => {
	//console.log(`incoming event: ${JSON.stringify(evt)}`);

	const updateMsg = evt.detail as IncomingMessageTypeUpdated;
	if (updateMsg.blob) {
		const recipe = JSON.parse(updateMsg.blob) as unknown;
		const parsedRecipe = PartialRecipeModel.parse(recipe);
		const newDescription = await paraphraseDescription(
			parsedRecipe.description,
		);
		const newInstructions = await paraphraseRecipeSteps(
			parsedRecipe.instructions.map((i) => i.description),
		);
		return {
			newDescription,
			newInstructions,
		};
	} else {
		throw new Error(`Delete events are not currently supported`);
	}
};

//local test
const rawRecipe = fs.readFileSync('./test.json').toString();
/*
    id: string;
    version: string;
    account: string;
    time: string;
    region: string;
    resources: string[];
    source: string;
    "detail-type": TDetailType;
    detail: TDetail;
 */

(
	handler(
		{
			id: 'test',
			version: '1',
			account: 'test',
			time: new Date().toISOString(),
			region: 'local',
			resources: [],
			source: 'local-test',
			'detail-type': 'recipe',
			detail: {
				blob: rawRecipe,
				checksum: 'zzzzz',
				uid: 'xxxxxx',
			},
		},
		// @ts-expect-error -- just testing
		null,
		null,
	) as Promise<OutgoingMessage>
)
	.then((msg) => console.log(`done: ${JSON.stringify(msg)}`))
	.catch((err) => console.error(err));
