import type {AttributeValue, DeleteItemCommandOutput, DynamoDBClient, WriteRequest} from "@aws-sdk/client-dynamodb";
import {BatchWriteItemCommand, DeleteItemCommand, QueryCommand, ScanCommand} from "@aws-sdk/client-dynamodb";
import {lastUpdatedIndex as IndexName, MaximumRetries, indexTableName as TableName} from "./config";
import type {RecipeDatabaseKey, RecipeIndex, RecipeIndexEntry} from './models';
import {RecipeIndexEntryFromDynamo} from "./models";
import {awaitableDelay} from "./utils";
import {Table} from "aws-cdk-lib/aws-dynamodb";

type DynamoRecord =  Record<string, AttributeValue>;

interface DataPage {
  ExclusiveStartKey?: DynamoRecord;
  recipes: RecipeIndexEntry[];
}

async function retrieveIndexPage(client: DynamoDBClient, ExclusiveStartKey? : DynamoRecord): Promise<DataPage>
{
  const req = new ScanCommand({
    ExclusiveStartKey,
    IndexName,
    TableName,
  })

  const response = await client.send(req);
  return {
    ExclusiveStartKey: response.LastEvaluatedKey,
    recipes: response.Items ? response.Items.map(RecipeIndexEntryFromDynamo) : []
  };
}

export async function retrieveIndexData(client: DynamoDBClient) : Promise<RecipeIndex> {
   let nextKey: DynamoRecord|undefined = undefined;
   const recipes: RecipeIndexEntry[] = [];

   do {
      const page = await retrieveIndexPage(client, nextKey);
      nextKey = page.ExclusiveStartKey;
      recipes.push(...page.recipes);
    } while (nextKey);

   return {schemaVersion: 1, recipes, lastUpdated: new Date()}
}

export async function recipesforArticle(client:DynamoDBClient, articleCanonicalId: string): Promise<RecipeIndexEntry[]>
{
  const req = new QueryCommand({
    TableName,
    KeyConditionExpression: "capiArticleId=:artId",
    ExpressionAttributeValues: {
      ":artId": {S: articleCanonicalId},
    }
  });

  const response = await client.send(req);
  return response.Items ? response.Items.map(RecipeIndexEntryFromDynamo) : [];
}


/**
 * Remove a single recipe from the index.
 *
 * If you want to remove a batch of recipes then bulkRemoveRecipe might be more efficient
 * @param client dynamoDB client
 * @param canonicalArticleId article ID containing the recipe to remove
 * @param recipeUID uid of the recipe to remove
 */
export async function removeRecipe(client: DynamoDBClient, canonicalArticleId:string, recipeUID: string):Promise<DeleteItemCommandOutput>
{
  const req = new DeleteItemCommand({
    TableName,
    Key: {
      capiArticleId: {S: canonicalArticleId},
      recipeUID: {S: recipeUID},
    }
  });

  return client.send(req)
}

/**
 * Finds all of the recipes associated with the given article and removes them using the bulk-delete functionality.
 *
 * Returns an array of RecipeIndexEntry containing details of the removed recipes, so content can also be purged.
 * @param client
 * @param canonicalArticleId
 */
export async function removeAllRecipeIndexEntriesForArticle(client: DynamoDBClient, canonicalArticleId: string): Promise<RecipeIndexEntry[]>
{
  const req = new QueryCommand({
    TableName,
    KeyConditionExpression: "capiArticleId=:artId",
    ExpressionAttributeValues: {
      ":artId": {S: canonicalArticleId}
    }
  });

  const contentToRemove = await client.send(req);
  if(contentToRemove.Count===0 || !contentToRemove.Items) {
    console.log(`No recipes to take down for article ${canonicalArticleId}`);
    return []
  } else {
    const entries:RecipeIndexEntry[] = contentToRemove.Items
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- dbEntry["recipeUID"] _can_ be undefined in reality
      .filter(dbEntry=>!!dbEntry["recipeUID"]?.S)
      .map(RecipeIndexEntryFromDynamo);

    const recepts:RecipeDatabaseKey[] = contentToRemove.Items
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- dbEntry["recipeUID"] _can_ be undefined in reality
      .filter(dbEntry=>!!dbEntry["recipeUID"]?.S)
      .map(dbEntry=>({
        capiArticleId: canonicalArticleId,
        recipeUID: dbEntry["recipeUID"].S as string
      }));
    console.log(`${recepts.length} recipes to remove for article ${canonicalArticleId}`);
    await bulkRemoveRecipe(client, recepts);
    return entries
  }
}

async function bulkRemovePage(client:DynamoDBClient, page:WriteRequest[], others:WriteRequest[], retryCount:number):Promise<void>
{
  if(page.length==0) {
    if(others.length==0) {
      //we are done. Shouldn't get here, but meh.
      return
    } else {
      //ok for some weird reason we got an empty array to process but more to do.
      return bulkRemovePage(client, others, [], 0);
    }
  }

  const RequestItems:Record<string, WriteRequest[]> = {};
  RequestItems[TableName as string] = page;

  const req = new BatchWriteItemCommand({
    RequestItems,
  });
  const result = await client.send(req);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the check for !!result.UnprocessedItems[TableName as string] is actually necessary
  if(result.UnprocessedItems && !!result.UnprocessedItems[TableName as string] && result.UnprocessedItems[TableName as string].length > 0) {
    if(retryCount > MaximumRetries) {
      console.error(`ERROR Could not remove items after maximum number of attempts, giving up.`);
      throw new Error("Unable to remove all items");
    }
    console.log(`WARNING Could not remove all items on attempt ${retryCount}. Pausing before trying again...`);
    await awaitableDelay();
    return bulkRemovePage(client, result.UnprocessedItems[TableName as string], others, retryCount+1);
  } else if(others.length>0) {
    const nextPage = others.slice(0, 25);
    const nextOthers = others.length>25 ? others.slice(25) : [];
    return bulkRemovePage(client, nextPage, nextOthers, 0);
  } else {
    return
  }
}

/**
 * Utilise the batch write functionality of Dynamo to remove a bunch of recipes in one go.
 * This is more efficient than removing each one manually.
 * @param client DynamoDB client
 * @param receps array of RecipeDatabaseKey[] identifying the recipes to remove from the index
 */
async function bulkRemoveRecipe(client: DynamoDBClient, receps:RecipeDatabaseKey[]):Promise<void>
{
  const requests:WriteRequest[] = receps.map(recep=>({
    DeleteRequest: {
      Key: {
        capiArticleId: {S: recep.capiArticleId},
        recipeUID: {S: recep.recipeUID},
      }
    }
  }));

  if(requests.length>25) {
    return bulkRemovePage(client, requests.slice(0, 25), requests.slice(25), 0)
  } else {
    return bulkRemovePage(client, requests, [], 0);
  }
}

