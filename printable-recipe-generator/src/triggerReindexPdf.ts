import * as process from 'node:process';
import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import {
	EventBridgeClient,
	PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import fetch from 'node-fetch';

console.log('Trigger script starting...');

const REGION: string = process.env['AWS_REGION'] ?? 'eu-west-1';
const stage: string = process.env['STAGE'] ?? 'CODE';
const recipeBaseUrl =
	stage === 'PROD'
		? 'https://recipes.guardianapis.com'
		: 'https://recipes.code.dev-guardianapis.com';
const indexUrl = `${recipeBaseUrl}/v2/index.json`;
const contentUrl = `${recipeBaseUrl}/content`;
const BATCH_SIZE = 10; //limitation of Put Item to Event Bridge

const eb = new EventBridgeClient({ region: REGION });

console.log('Trigger script started...');

interface RecipeIndexSchema {
	checksum: string;
}
interface IndexSchema {
	recipes: RecipeIndexSchema[];
}

async function loadIndexForAllIds(): Promise<string[]> {
	const response = await fetch(indexUrl);

	if (response.status !== 200) {
		throw new Error(`Failed to fetch index file: ${response.status}`);
	}

	const result = (await response.json()) as IndexSchema;

	console.log(`Recipe Id's found from Index, length ${result.recipes.length}`);
	return result.recipes.map((_) => _.checksum);
}

async function loadRecipeJson(checksum: string): Promise<string> {
	const url = `${contentUrl}/${checksum}`;
	const response = await fetch(url);
	if (response.status === 404) {
		throw new Error(`404 Not Found for recipe Checksum:  ${checksum}`);
	}
	if (response.status !== 200)
		throw new Error(
			`Failed to fetch recipe JSON for ID ${checksum}: ${response.status}`,
		);
	else {
		const result = (await response.json()) as string;
		// console.log(
		// 	`Recipe JSON found from Index, length ${JSON.stringify(result)}`,
		// );
		return result;
	}
}

function storeInBatches<T>(array: T[], size: number): T[][] {
	//prepare batches of 10
	const result: T[][] = [];
	if (array.length > 0) {
		for (let i = 0; i < array.length; i += size) {
			result.push(array.slice(i, i + size));
		}
	}
	return result;
}

async function sendToEventBridge(recipes: string[]): Promise<void> {
	const entries: PutEventsRequestEntry[] = recipes.map((r) => ({
		Source: 'pdf-reindex',
		DetailType: 'recipe-update',
		EventBusName: 'default',
		Time: new Date(),
		Detail: JSON.stringify(r),
	}));

	for (let i = 0; i < entries.length; i += 10) {
		const batch = entries.slice(i, i + 10);
		const command = new PutEventsCommand({ Entries: batch });
		const response = await eb.send(command);
		console.log(`Sent batch ${i / 10 + 1}:`, response);
		if (response.FailedEntryCount && response.FailedEntryCount > 0) {
			console.error(
				'Failed entries:',
				response.Entries?.filter((e) => e.ErrorCode),
			);
		}
	}
}

void (async (): Promise<void> => {
	try {
		console.log('Fetching index from URL...');
		const checksums = await loadIndexForAllIds();
		console.log('Storing in batches of 10...');
		const batches = storeInBatches(checksums, BATCH_SIZE);

		for (let i = 0; i < batches.length; i++) {
			const batch = batches[i];
			console.log(`Processing batch ${i + 1} with ${batch.length} IDs...`);
			const recipeData = await Promise.all(
				batch.map(async (checksum) => {
					try {
						return await loadRecipeJson(checksum);
					} catch (err) {
						if (err instanceof Error && err.message.includes('404')) {
							console.warn(`Skipping missing recipe for ID ${checksum}`);
							return null;
						}
						throw err; // Re-throw non-404 errors
					}
				}),
			);
			console.log('Filter valid json');
			const validRecipeData = recipeData.filter((r): r is string => r !== null);

			if (validRecipeData.length > 0) {
				console.log('Sending batch to EventBridge now..');
				await sendToEventBridge(validRecipeData);
			} else {
				console.warn(
					`No valid recipes in this batch, skipping send to Eventbridge.`,
				);
			}
		}
	} catch (err) {
		console.error('Batch process failed:', err);
	}
})();
