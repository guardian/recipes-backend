import * as process from 'node:process';
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

async function recipeForUid(
	uid: string,
	apiKey: string,
): Promise<Record<string, never>> {
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
	return response.json() as Promise<Record<string, never>>;
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

	const updated: MiseEnPlaceDataFormat = [];
	for (const container of frontData) {
		console.log(`Container ${container.title}`);
		const newItems: EmbellishedContainerItem[] = [];

		for (const item of container.items) {
			if ('recipe' in item) {
				const recipeData = await recipeForUid(item.recipe.id, apiKey);
				newItems.push({
					recipe: {
						id: item.recipe.id,
						imgTemplateUrl: (recipeData.featuredImage as Record<string, string>)
							.templateUrl,
						title: recipeData.title as string,
						byline: recipeData.byline as string[],
						contributors: recipeData.contributors as string[],
						suitableForDietIds: recipeData.suitableForDietIds as string[],
						checksum: '????',
					},
				});
			} else {
				newItems.push(item);
			}
		}

		updated.push({
			title: container.title,
			id: container.id,
			body: container.body,
			items: newItems,
		});
	}

	console.log(JSON.stringify(updated));
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
