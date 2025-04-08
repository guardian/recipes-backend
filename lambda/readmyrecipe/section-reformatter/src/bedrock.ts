import * as process from 'node:process';
import type {
	Message,
	SystemContentBlock,
} from '@aws-sdk/client-bedrock-runtime';
import {
	BedrockRuntimeClient,
	ConverseCommand,
	StopReason,
} from '@aws-sdk/client-bedrock-runtime';
import { getBedrockModelName } from './config';

const client = new BedrockRuntimeClient({ region: process.env['AWS_REGION'] });

const genericSystemPrompt = `You are a scriptwriter for a voice assistent.  Your job is to take written prose optimised for reading on-screen
			and rewrite it to be optimised for being spoken aloud.

			The text will be fragments of recipes so you should ensure that the outgoing is concise and contains all of the points
			of the incoming text.  Correct any grammatical errors so they they can be read aloud smoothly by an actor.
			Each step should flow nicely from the end of the previous reply.

			Please expand abbreviations to how they would be said, i.e. \`e.g.\` should be read as \`for example\`;
			\`180°C\` should be read as \`one hundred and eighty degrees celsius\`; \`250°F\` should be read as \`two hundred and
			fifty degrees Farenheit.  Alternatives should be stipulated as such, for example \`Preheat to 180°C (160°C fan)\` should
			be read as \`Preheat to one hundred and eighty degrees celsius, or one hundred and sixty if you have a fan oven\`

			Finally the text will be parsed by an automated system so please return it surrounded by the fence \`\`\`.
      `;

/**
 * remove any fencing or surrounding content from the model reply
 * TODO: currently a stub
 * @param modelReply
 */
function extractUsefulText(modelReply: string): string {
	const splitout = modelReply.split('```');
	return splitout[0] ? splitout[0].trim() : '';
}

export async function paraphraseDescription(desc: string): Promise<string> {
	const modelId = getBedrockModelName();

	const system: SystemContentBlock[] = [
		{
			text: genericSystemPrompt,
		},
	];

	const messages: Message[] = [
		{
			role: 'user',
			content: [
				{
					text:
						'Please rewrite the following recipe description to be suitable for reading aloud:\n\n```' +
						desc +
						'\n```\n',
				},
			],
		},
		{
			role: 'assistant',
			content: [
				{
					text: '```',
				},
			],
		},
	];

	const cmd = new ConverseCommand({
		system,
		modelId,
		messages,
		inferenceConfig: { temperature: 0.1 },
	});

	return sendAndProcessReply(cmd);
}

export async function paraphraseRecipeSteps(
	steps: string[],
): Promise<string[]> {
	let messageChain: Message[] = [];

	for (const step of steps) {
		messageChain = await paraphraseNextRecipeStep(step, messageChain);
	}
	console.log(`DEBUG: returned chain is ${JSON.stringify(messageChain)}`);
	const output = messageChain
		.filter((m) => m.role === 'assistant')
		.flatMap((m) => m.content)
		.map((c) => c?.text)
		.filter((text) => !!text);
	return output as string[];
}

async function paraphraseNextRecipeStep(
	thisStep: string,
	msgs: Message[],
): Promise<Message[]> {
	const modelId = getBedrockModelName();

	const system: SystemContentBlock[] = [
		{
			text: genericSystemPrompt,
		},
	];

	const messages = msgs;
	messages.push(
		{
			role: 'user',
			content: [
				{
					text:
						'Please rewrite the next recipe step to be suitable for reading aloud:\n\n```' +
						thisStep +
						'\n```\n',
				},
			],
		},
		{
			role: 'assistant',
			content: [
				{
					text: '```',
				},
			],
		},
	);

	const cmd = new ConverseCommand({
		system,
		modelId,
		messages,
		inferenceConfig: { temperature: 0.0 },
	});

	const nextMsg = await sendAndProcessReply(cmd);
	messages.pop(); //drop the last one
	messages.push({
		role: 'assistant',
		content: [
			{
				text: nextMsg,
			},
		],
	});
	return messages;
}

async function sendAndProcessReply(cmd: ConverseCommand): Promise<string> {
	const response = await client.send(cmd);

	switch (response.stopReason) {
		case StopReason.STOP_SEQUENCE:
		case StopReason.END_TURN: {
			const maybeContent = response.output?.message?.content;
			if (!maybeContent || maybeContent.length == 0) {
				throw new Error('Valid stop sequence but no data was returned');
			}
			console.log(`Debug: model returned ${JSON.stringify(maybeContent)}`);
			const modelReply = maybeContent.reverse().find((blk) => !!blk.text);
			if (!modelReply) {
				throw new Error('Valid reply but there was no text block in content');
			}
			console.log(`Received content: ${JSON.stringify(modelReply)}`);
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we know that this is defined because we filtered for it above
			return extractUsefulText(modelReply.text!);
		}
		default:
			console.error(
				`Could not generate output, model stopped due to ${(
					response.stopReason ?? '(unknown)'
				).toString()}`,
			);
			throw new Error('No data was returned');
	}
}
