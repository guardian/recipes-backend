import type {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import { removeRecipe } from './dynamo';
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
