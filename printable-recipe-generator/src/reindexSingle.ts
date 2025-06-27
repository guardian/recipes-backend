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

interface RecipeIndexSchema {
	checksum: string;
	recipeUID: string;
}
interface IndexSchema {
	recipes: RecipeIndexSchema[];
}

interface RecipeSchema {
	uid: string;
	checksum: string;
	blob: string;
}

async function loadIndexForAllIds(): Promise<IndexSchema> {
	const response = await fetch(indexUrl);

	if (response.status !== 200) {
		throw new Error(`Failed to fetch index file: ${response.status}`);
	}

	const result = (await response.json()) as IndexSchema;

	console.log(`Recipe Id's found from Index, length ${result.recipes.length}`);
	return result; // .recipes.map((r) => r.checksum);
}

async function loadRecipeJson(
	recipeItem: RecipeIndexSchema,
): Promise<RecipeSchema> {
	const url = `${contentUrl}/${recipeItem.checksum}`;
	const response = await fetch(url);
	if (response.status === 404) {
		throw new Error(
			`404 Not Found for recipe Checksum:  ${recipeItem.checksum}`,
		);
	}
	if (response.status !== 200)
		throw new Error(
			`Failed to fetch recipe JSON for ID ${recipeItem.checksum}: ${response.status}`,
		);
	else {
		const result = await response.text();

		const recipeSchemaResult: RecipeSchema = {
			uid: recipeItem.recipeUID,
			checksum: recipeItem.checksum,
			blob: result,
		};
		return recipeSchemaResult;
	}
}

async function pdfAlreadyExists(
	recipeItem: RecipeIndexSchema,
): Promise<boolean> {
	const url = `${contentUrl}/${recipeItem.checksum}.pdf`;
	const response = await fetch(url, { method: 'HEAD' });
	if (response.status === 200) {
		return true;
	} else if (response.status === 404) {
		return false;
	} else {
		throw new Error(`Unexpected response to HEAD ${url}: ${response.status}`);
	}
}

async function sendToEventBridge(recipes: RecipeSchema[]): Promise<void> {
	const entries: PutEventsRequestEntry[] = recipes.map((r) => ({
		Source: 'pdf-reindex',
		DetailType: 'recipe-update',
		EventBusName: `publication-events-${stage}`,
		Time: new Date(),
		Detail: JSON.stringify({
			uid: r.uid,
			checksum: r.checksum,
		}),
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

async function filterOnlyNeeded(
	recipes: RecipeIndexSchema[],
): Promise<RecipeIndexSchema[]> {
	const results = await Promise.all(
		recipes.map(async (r) => {
			const exists = await pdfAlreadyExists(r);
			return exists ? null : r;
		}),
	);
	return results.filter((r): r is RecipeIndexSchema => r !== null);
}

void (async (): Promise<void> => {
	if (!process.argv[2] || process.argv[2] == '') {
		console.log(
			'You must provide either the checksum ID or unique ID for the recipe to reindex',
		);

		process.exit(2);
	}

	try {
		console.log('Fetching index from URL...');
		const recipeItems = await loadIndexForAllIds();

		const maybeItem =
			recipeItems.recipes.find((ent) => ent.checksum === process.argv[2]) ??
			recipeItems.recipes.find((ent) => ent.recipeUID === process.argv[2]);

		if (maybeItem) {
			const content = await loadRecipeJson(maybeItem);
			console.log('Sending batch to EventBridge now..');
			await sendToEventBridge([content]);
		} else {
			console.log('Could not find any recipe with that ID');
		}
	} catch (err) {
		console.error('Batch process failed:', err);
	}
})();
