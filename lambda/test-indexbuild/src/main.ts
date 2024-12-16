import type { Handler } from 'aws-lambda';
import {
	INDEX_JSON,
	retrieveIndexData,
	V2_INDEX_JSON,
	writeIndexData,
} from '@recipes-api/lib/recipes-data';
import {
	getContentPrefix,
	getFastlyApiKey,
	getStaticBucketName,
} from 'lib/recipes-data/src/lib/config';

export const handler: Handler = async () => {
	const staticBucketName = getStaticBucketName();
	const contentPrefix = getContentPrefix();
	const fastlyApiKey = getFastlyApiKey();

	console.log('Index test starting up');

	console.log('Retrieving index data...');
	const indexDataForAllRecipes = await retrieveIndexData();
	const indexDataForUnSponsoredRecipes = {
		...indexDataForAllRecipes,
		recipes: indexDataForAllRecipes.recipes.filter(
			(r) => r.sponsorshipCount === 0,
		),
	};
	console.log(
		`Length of unsponsored: ${indexDataForUnSponsoredRecipes.recipes.length}`,
	);

	console.log(`Length of sponsored: ${indexDataForAllRecipes.recipes.length}`);

	console.log(`Dump of sponsored recipe index entries follows: `);
	for (const entry of indexDataForAllRecipes.recipes) {
		if (
			!indexDataForUnSponsoredRecipes.recipes.find(
				(r) => r.capiArticleId === entry.capiArticleId,
			)
		) {
			console.log(entry);
		}
	}

	console.log('Done.');
	await writeIndexData({
		indexData: indexDataForUnSponsoredRecipes,
		Key: INDEX_JSON,
		staticBucketName,
		contentPrefix,
		fastlyApiKey,
	});
	await writeIndexData({
		indexData: indexDataForAllRecipes,
		Key: V2_INDEX_JSON,
		staticBucketName,
		contentPrefix,
		fastlyApiKey,
	});
	console.log('All completed.');
};
