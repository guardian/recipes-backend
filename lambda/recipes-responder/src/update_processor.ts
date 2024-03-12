import type {Content} from "@guardian/content-api-models/v1/content";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import type {RecipeReference} from "@recipes-api/lib/recipes-data";
import {
  calculateChecksum,
  extractAllRecipesFromArticle,
  insertNewRecipe,
  publishRecipeContent,
  recipesToTakeDown,
  removeRecipeVersion
} from "@recipes-api/lib/recipes-data";
import {sendTelemetryEvent} from "./telemetry";

/**
 * Pushes new content into the service
 * @param canonicalArticleId
 * @param recep
 */
async function publishRecipe(canonicalArticleId:string, recep:RecipeReference):Promise<void>
{
  try {
    await sendTelemetryEvent("PublishedData", recep.recipeUID, recep.jsonBlob);
  } catch(err) {
    console.error(`ERROR [${canonicalArticleId}] - unable to send telemetry: `, err);
  }
  console.log(`INFO [${canonicalArticleId}] - pushing ${recep.recipeUID} @ ${recep.checksum} to S3...`);
  await publishRecipeContent(recep);
  console.log(`INFO [${canonicalArticleId}] - updating index table...`);
  await insertNewRecipe(canonicalArticleId, {recipeUID: recep.recipeUID, checksum: recep.checksum});
}

/**
 * Takes an updated article and updates any recipes from inside it
 * @param content - Content of an incoming article
 * @returns a number, representing the number of recipes that were added plus the number that were deleted (i.e., an
 * update counts as 1 add and 1 delete)
 */
export async function handleContentUpdate(content:Content):Promise<number>
{
  try {
    if (content.type != ContentType.ARTICLE) return 0;  //no point processing live-blogs etc.

    const recipesFound = await extractAllRecipesFromArticle(content)
    const allRecipes: RecipeReference[] = recipesFound.map(calculateChecksum);
    console.log(`INFO [${content.id}] - has ${allRecipes.length} recipes`);

    const entriesToRemove = await recipesToTakeDown(content.id, allRecipes.map(recep => recep.recipeUID));
    console.log(`INFO [${content.id}] - ${entriesToRemove.length} recipes have been removed/superceded in the incoming article`);
    if (allRecipes.length == 0 && entriesToRemove.length == 0) return 0;  //no point hanging around and noising up the logs
    await Promise.all(entriesToRemove.map(recep => removeRecipeVersion(content.id, recep)));
    console.log(`INFO [${content.id}] - ${entriesToRemove.length} removed/superceded recipes have been removed from the store`);

    console.log(`INFO [${content.id}] - publishing ${allRecipes.length} new/updated recipes to the service`)
    await Promise.all(allRecipes.map(recep => publishRecipe(content.id, recep)))

    console.log(`INFO [${content.id}] - Done`);
    return allRecipes.length + entriesToRemove.length;
  } catch(err) {
    //log out what actually caused the breakage
    console.error("Failed article was: ", JSON.stringify(content));
    console.error(err);
    throw err;
  }
}

