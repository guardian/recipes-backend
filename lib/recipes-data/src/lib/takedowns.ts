import type {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import { recipesforArticle } from './dynamo';
import type { RecipeIndexEntry } from './models';

/**
 * This function checks an incoming list of recipes (from an article update) against the list of recipes
 * currently present.  If we are missing any of the "current" recipes then these should be taken down.
 * @param dynamoClient DynamoDB client so we can query the index database
 * @param canonicalArticleId ID of the article that's being updated
 * @param recipeIdsToKeep list of the "new" recipes that are in the update (and should therefore be kept)
 * @return list of the recipes that were present in the current version but not in the update. These should be taken down.
 */
export async function recipesToTakeDown(dynamoClient:DynamoDBClient, canonicalArticleId:string, recipeIdsToKeep: string[]):Promise<RecipeIndexEntry[]>
{
  const toKeepSet = new Set(recipeIdsToKeep);
  const currentSet = await recipesforArticle(dynamoClient, canonicalArticleId);

  //ES6 does not give us a Set.difference method, unfortunately. So we have to do it here.
  return currentSet.filter(rec=>!toKeepSet.has(rec.uid));
}
