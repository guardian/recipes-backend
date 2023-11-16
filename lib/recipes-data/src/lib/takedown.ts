import type {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {removeAllRecipeIndexEntriesForArticle, removeRecipe} from './dynamo';
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
  return takeRecipeDown(client, canonicalArticleId, recipe, false);
}

export async function removeAllRecipesForArticle(client: DynamoDBClient, canonicalArticleId: string): Promise<void>
{
  const removedEntries = await removeAllRecipeIndexEntriesForArticle(client, canonicalArticleId);
  console.log(`Taken down article ${canonicalArticleId} had ${removedEntries.length} recipes in it which will also be removed`);
  await Promise.all(removedEntries.map(recep=>removeRecipeContent(recep.checksum, "soft")));
}
