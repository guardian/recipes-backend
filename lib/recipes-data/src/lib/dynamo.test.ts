import {BatchWriteItemCommand, DeleteItemCommand, DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {mockClient} from "aws-sdk-client-mock";
import {bulkRemoveRecipe, removeRecipe} from './dynamo';
import type { RecipeDatabaseKey } from './models';

jest.mock("node-fetch");

jest.mock("./config", ()=>({
  indexTableName: "TestTable"
}));

const mockDynamoClient = mockClient(DynamoDBClient);
const ddbClient = new DynamoDBClient(); //this is actually a mock now

function makeRecptBatch(length:number): RecipeDatabaseKey[]
{
  const results:RecipeDatabaseKey[] = [];

  for(let i=0;i<length;i++) {
    results.push({
      capiArticleId: `path/to/article${i}`,
      recipeUID: `uid-${i}`
    })
  }
  return results;
}

describe("dynamodb", ()=>{
  beforeEach(()=>{
    mockDynamoClient.reset();
    jest.resetAllMocks();
  });

  describe("dynamodb.removeRecipe", ()=>{
    it("should make a Dynamo request to remove the relevant record", async ()=>{
      mockDynamoClient.on(DeleteItemCommand).resolves({});

      await removeRecipe(ddbClient, "path/to/some/article-id", "xxxyyyzzz");
      expect(mockDynamoClient.commandCalls(DeleteItemCommand).length).toEqual(1);
      const call = mockDynamoClient.commandCalls(DeleteItemCommand)[0];
      const req = call.firstArg as DeleteItemCommand;
      expect(req.input.Key).toEqual({
        capiArticleId: {S: "path/to/some/article-id"},
        recipeUID: {S: "xxxyyyzzz"}
      });
      expect(req.input.TableName).toEqual("TestTable");
    })
  });

  describe("dynamodb.bulkRemoveRecipe", ()=>{
    it("should handle a small (<25) batch of articles", async ()=>{
      mockDynamoClient.on(BatchWriteItemCommand).resolves({
        UnprocessedItems: {"TestTable": []},
      });

      await bulkRemoveRecipe(ddbClient, makeRecptBatch(6));
      expect(mockDynamoClient.commandCalls(BatchWriteItemCommand).length).toEqual(1);
      const call = mockDynamoClient.commandCalls(BatchWriteItemCommand)[0];
      const req = call.firstArg as BatchWriteItemCommand;
      const items = req.input.RequestItems?.TestTable ?? [];
      expect(items.length).toEqual(6);
      for(let i=0; i<6; i++) {
        expect(items[i].DeleteRequest).toEqual({
          Key: {capiArticleId: {S: `path/to/article${i}`}, recipeUID: {S: `uid-${i}`}}
        });
      }
    });

    it("should paginate a large (>25) batch of articles", async ()=>{
      mockDynamoClient.on(BatchWriteItemCommand).resolves({
        UnprocessedItems: {"TestTable": []},
      });

      await bulkRemoveRecipe(ddbClient, makeRecptBatch(93));
      expect(mockDynamoClient.commandCalls(BatchWriteItemCommand).length).toEqual(4);

      //for brevity, we're just checking the last page of calls
      const call = mockDynamoClient.commandCalls(BatchWriteItemCommand)[3];
      const req = call.firstArg as BatchWriteItemCommand;
      const items = req.input.RequestItems?.TestTable ?? [];
      expect(items.length).toEqual(18);
      for(let i=75; i<93; i++) {
        expect(items[i-75].DeleteRequest).toEqual({
          Key: {capiArticleId: {S: `path/to/article${i}`}, recipeUID: {S: `uid-${i}`}}
        });
      }
    });

    it("should loop to ensure that unprocessed items get retried", async ()=>{
      const items = makeRecptBatch(8)
      mockDynamoClient.on(BatchWriteItemCommand)
        .resolvesOnce({
          UnprocessedItems: {"TestTable": [
              {
                DeleteRequest: {Key: {
                  capiArticleId: {S: items[3].capiArticleId },
                    recipeUID: {S: items[3].recipeUID},
                }},
              },
              {
                DeleteRequest: {Key: {
                    capiArticleId: {S: items[5].capiArticleId },
                    recipeUID: {S: items[5].recipeUID},
                  }},
              },
            ]}
        })
        .resolves({});

      await bulkRemoveRecipe(ddbClient, items);

      //We expect two write calls, one with all 8 of the items and the second with the two that were skipped
      expect(mockDynamoClient.commandCalls(BatchWriteItemCommand).length).toEqual(2);

      const firstCall = mockDynamoClient.commandCalls(BatchWriteItemCommand)[0];
      const firstReq = firstCall.firstArg as BatchWriteItemCommand;
      const firstItems = firstReq.input.RequestItems?.TestTable ?? [];
      expect(firstItems.length).toEqual(8);
      for(let i=0; i<8; i++) {
        expect(firstItems[i].DeleteRequest).toEqual({Key: {capiArticleId: {S: items[i].capiArticleId}, recipeUID: {S: items[i].recipeUID}}});
      }

      const secondCall = mockDynamoClient.commandCalls(BatchWriteItemCommand)[1];
      const secondReq = secondCall.firstArg as BatchWriteItemCommand;
      const secondItems = secondReq.input.RequestItems?.TestTable ?? [];
      expect(secondItems.length).toEqual(2);
      expect(secondItems[0].DeleteRequest).toEqual({Key: {capiArticleId: {S: items[3].capiArticleId}, recipeUID: {S: items[3].recipeUID}}});
      expect(secondItems[1].DeleteRequest).toEqual({Key: {capiArticleId: {S: items[5].capiArticleId}, recipeUID: {S: items[5].recipeUID}}});

    })
  });

  //FIXME: TODO!!
  describe("dynamodb.removeAllRecipeIndexEntriesForArticle", ()=>{

  });
})
