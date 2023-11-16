import type {AttributeValue, DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {QueryCommand, ScanCommand} from "@aws-sdk/client-dynamodb";
import {lastUpdatedIndex as IndexName, indexTableName as TableName} from "./config";
import type {RecipeIndex, RecipeIndexEntry, RecipeReference} from './models';
import {RecipeIndexEntryFromDynamo} from "./models";

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
