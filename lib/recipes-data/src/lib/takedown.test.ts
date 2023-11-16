import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {mockClient} from "aws-sdk-client-mock";
import { removeAllRecipeIndexEntriesForArticle, removeRecipe } from './dynamo';
import {removeRecipeContent} from "./s3";
import {removeAllRecipesForArticle, removeRecipePermanently, removeRecipeVersion} from './takedown';
import {RecipeIndexEntry} from "@recipes-api/lib/recipes-data";

mockClient(DynamoDBClient);
const ddbClient = new DynamoDBClient(); //this is a mock object due to `mockClient` above

jest.mock("./s3", ()=>({
  removeRecipeContent: jest.fn(),
}));

jest.mock("./dynamo", ()=>({
  removeAllRecipeIndexEntriesForArticle: jest.fn(),
  removeRecipe: jest.fn(),
}));

describe("takedown", ()=>{
  beforeEach(()=>{
    jest.resetAllMocks();
    //@ts-ignore -- Typescript doesn't know that this is a mock
    removeRecipeContent.mockReturnValue(Promise.resolve());
    //@ts-ignore -- Typescript doesn't know that this is a mock
    removeRecipe.mockReturnValue(Promise.resolve());
  });

  it("removeRecipePermanently should delete the given recipe from the index and from the content bucket", async ()=>{
    await removeRecipePermanently(ddbClient, "path/to/some/article", {recipeUID: "some-uid", checksum: "xxxyyyzzz"});

    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipe.mock.calls.length).toEqual(1);
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeContent.mock.calls.length).toEqual(1);

    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipe.mock.calls[0][1]).toEqual("path/to/some/article");
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipe.mock.calls[0][2]).toEqual("some-uid");
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeContent.mock.calls[0][0]).toEqual("xxxyyyzzz");
  });

  it("removeRecipeVersion should delete the given recipe from the content bucket but not the index", async ()=>{
    await removeRecipeVersion(ddbClient, "path/to/some/article", {recipeUID: "some-uid", checksum: "xxxyyyzzz"});

    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipe.mock.calls.length).toEqual(0);
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeContent.mock.calls.length).toEqual(1);

    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeContent.mock.calls[0][0]).toEqual("xxxyyyzzz");
  });

  it("removeAllRecipesForArticle should remove all entries from the database and use the information gleaned to remove from content bucket", async ()=>{
    const knownArticles:RecipeIndexEntry[] = [
      {
        checksum: "abcd",
        recipeUID:"r1"
      },
      {
        checksum: "efg",
        recipeUID:"r2"
      },
      {
        checksum: "hij",
        recipeUID:"r3"
      },
    ];

    //@ts-ignore -- Typescript doesn't know that this is a mock
    removeAllRecipeIndexEntriesForArticle.mockReturnValue(Promise.resolve(knownArticles));

    await removeAllRecipesForArticle(ddbClient, "path/to/some/article");

    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeAllRecipeIndexEntriesForArticle.mock.calls.length).toEqual(1);
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeAllRecipeIndexEntriesForArticle.mock.calls[0][1]).toEqual("path/to/some/article");
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeContent.mock.calls.length).toEqual(3);
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeContent.mock.calls[0]).toEqual(["abcd", "soft"]);
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeContent.mock.calls[1]).toEqual(["efg", "soft"]);
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeContent.mock.calls[2]).toEqual(["hij", "soft"]);
  });
})
