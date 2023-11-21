import type {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {recipesforArticle, removeAllRecipeIndexEntriesForArticle, removeRecipe} from './dynamo';
import type { RecipeIndexEntry } from './models';
import {removeRecipeContent} from "./s3";

async function takeRecipeDown(client: DynamoDBClient, canonicalArticleId: string, recipe: RecipeIndexEntry, removeFromDatabase: boolean):Promise<void>
{
  if(removeFromDatabase) {
    console.log(`takeRecipeDown: removing recipe ${recipe.recipeUID} for ${canonicalArticleId} from the index`);
    await removeRecipe(client, canonicalArticleId, recipe.recipeUID);
  }
  console.log(`takeRecipeDown: removing content version ${recipe.checksum} for ${recipe.recipeUID} on ${canonicalArticleId} from the store`);
  await removeRecipeContent(recipe.checksum);
  console.log(`takeRecipeDown: complete for ${recipe.checksum} for ${recipe.recipeUID} on ${canonicalArticleId}`);
}

/**
 * Call this function if you have a recipe which has been deleted, not updated, and must therefore be wiped from the index
 *
 * @param client
 * @param canonicalArticleId
 * @param recipe
 */
export async function removeRecipePermanently(client: DynamoDBClient, canonicalArticleId: string, recipe: RecipeIndexEntry)
{
  return takeRecipeDown(client, canonicalArticleId, recipe, true);
}

/**
 * Call this function if you have a recipe which has been updated but not deleted
 *
 * @param client
 * @param canonicalArticleId
 * @param recipe
 */
export async function removeRecipeVersion(client: DynamoDBClient, canonicalArticleId: string, recipe: RecipeIndexEntry)
{
  //FIXME this is wrong wrong wrong! We should still remove from database, but with a conditional delete that
  //will not remove if the version ID has already changed.
  return takeRecipeDown(client, canonicalArticleId, recipe, false);
}

export async function removeAllRecipesForArticle(client: DynamoDBClient, canonicalArticleId: string): Promise<number>
{
  const removedEntries = await removeAllRecipeIndexEntriesForArticle(client, canonicalArticleId);
  console.log(`Taken down article ${canonicalArticleId} had ${removedEntries.length} recipes in it which will also be removed`);
  await Promise.all(removedEntries.map(recep=>removeRecipeContent(recep.checksum, "soft")));
  return removedEntries.length;
}

/**
 * This function checks an incoming list of recipes (from an article update) against the list of recipes
 * currently present.  If we are missing any of the "current" recipes then these should be taken down.
 * @param dynamoClient DynamoDB client so we can query the index database
 * @param canonicalArticleId ID of the article that's being updated
 * @param recipeChecksumsToKeep list of the "new" recipes that are in the update (and should therefore be kept)
 * @return list of the recipes that were present in the current version but not in the update. These should be taken down.
 */
export async function recipesToTakeDown(dynamoClient:DynamoDBClient, canonicalArticleId:string, recipeChecksumsToKeep: string[]):Promise<RecipeIndexEntry[]>
{
  const toKeepSet = new Set(recipeChecksumsToKeep);
  const currentSet = await recipesforArticle(dynamoClient, canonicalArticleId);

  //ES6 does not give us a Set.difference method, unfortunately. So we have to do it here.
  return currentSet.filter(rec=>!toKeepSet.has(rec.checksum));
}
