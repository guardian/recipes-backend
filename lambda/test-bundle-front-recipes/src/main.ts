import * as fs from 'node:fs';
import * as process from 'node:process';
import { undefined } from 'zod';
import type {
	ContainerItem,
	MiseEnPlaceDataFormat,
} from '@recipes-api/lib/facia';
import { FeastCuration, MiseEnPlaceData } from '@recipes-api/lib/facia';

async function getFrontByDate(
	region: string,
	variant: string,
	d: string,
): Promise<MiseEnPlaceDataFormat> {
	const url = `https://recipes.guardianapis.com/${region}/${variant}/${d}/curation.json`;
	const response = await fetch(url);
	if (response.status != 200) {
		throw new Error(`Recipes API returned ${response.status} for ${url}`);
	}

	const rawContent = (await response.json()) as unknown;
	return MiseEnPlaceData.parse(rawContent);
}

async function recipeForUid(uid: string, apiKey: string): Promise<string> {
	const response = await fetch(
		`https://recipes.guardianapis.com/api/content/by-uid/${uid}`,
		{
			redirect: 'follow',
			headers: {
				'X-Api-Key': apiKey,
			},
		},
	);
	if (response.status != 200) {
		throw new Error(
			`Unable to look up ${uid}: recipes api returned ${response.status}`,
		);
	}
	return response.text();
}

interface EmbellishedRecipeEntry {
	recipe: {
		id: string;
		imgTemplateUrl: string;
		title: string;
		contributors?: string[];
		byline?: string[];
		suitableForDietIds: string[];
		checksum: string;
	};
}

type EmbellishedContainerItem = ContainerItem | EmbellishedRecipeEntry;

function collectRecipeUUIDs(frontData: MiseEnPlaceDataFormat): string[] {
	// return frontData
	// 	.flatMap((collection) =>
	// 		collection.items.map((item) => {
	// 			if ('recipe' in item) {
	// 				return typeof item.recipe.id == 'string' ? item.recipe.id : undefined;
	// 			} else {
	// 				return undefined;
	// 			}
	// 		}),
	// 	)
	// 	.filter((maybeId) => !!maybeId) as string[];
	const results: string[] = [];
	for (const collection of frontData) {
		for (const item of collection.items) {
			if ('recipe' in item) {
				results.push(item.recipe.id);
			}
		}
	}

	return results;
}

async function main() {
	const apiKey = process.env['RECIPE_API_KEY'];
	if (!apiKey) {
		console.error('You must define RECIPE_API_KEY before running');
		process.exit(1);
	}

	const frontData = await getFrontByDate(
		'northern',
		'all-recipes',
		'2024-11-29',
	);

	const recipeidList = collectRecipeUUIDs(frontData);
	console.log(`Got ${recipeidList.length} recipes`);

	const output: string[] = [];

	for (const id of recipeidList) {
		console.log(id);
		const content = await recipeForUid(id, apiKey);
		output.push(content);
	}

	fs.writeFileSync('output.ndjson', output.join('\n'));

	//console.log(JSON.stringify(updated));
}

main()
	.then(() => {
		console.log('All done');
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
