import type {Handler} from "aws-lambda";
import {INDEX_JSON, retrieveIndexData, V2_INDEX_JSON, writeIndexData} from "@recipes-api/lib/recipes-data";


export const handler: Handler = async () => {
  console.log("Index test starting up");

  console.log("Retrieving index data...");
  const indexDataForAllRecipes = await retrieveIndexData();
  const indexDataForUnSponsoredRecipes = {
    ...indexDataForAllRecipes,
    recipes: indexDataForAllRecipes.recipes.filter(r => r.sponsorshipCount === 0)
  }
  console.log(`Length of unsponsored: ${indexDataForUnSponsoredRecipes.recipes.length}`)

  console.log(`Length of sponsored: ${indexDataForAllRecipes.recipes.length}`);

  console.log(`Dump of sponsored recipe index entries follows: `);
  for (const entry of indexDataForAllRecipes.recipes) {
    if (!indexDataForUnSponsoredRecipes.recipes.find(r => r.capiArticleId === entry.capiArticleId)) {
      console.log(entry);
    }
  }

  console.log("Done.")
  await writeIndexData(indexDataForUnSponsoredRecipes, INDEX_JSON);
  await writeIndexData(indexDataForAllRecipes, V2_INDEX_JSON);
  console.log("All completed.");
}
