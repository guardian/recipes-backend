import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {mockClient} from "aws-sdk-client-mock";
import { recipesforArticle } from './dynamo';
import type { RecipeIndexEntry } from './models';
import {recipesToTakeDown} from "./takedowns";

const mockDynamo = mockClient(DynamoDBClient);
const ddbFakeClient = new DynamoDBClient(); //the mocking above means that this is not a real client

jest.mock("./dynamo", ()=>({
  recipesforArticle: jest.fn()
}));

describe("recipesToTakeDown", ()=>{
  beforeEach(()=>{
    jest.resetAllMocks();
    mockDynamo.reset();
  });

  it("should return a list of recipe references that feature in the DB but not in the incoming update", async ()=>{
    const fakeDbContent:RecipeIndexEntry[] = [
      {
        sha: "vers938",
        uid: "number1"
      },
      {
        sha: "vers963",
        uid: "number2"
      },
      {
        sha: "vers346",
        uid: "number3"
      },
      {
        sha: "vers432",
        uid: "number4"
      },
      {
        sha: "vers9789",
        uid: "number5"
      },
    ];

    const fakeUpdateIds:string[] = ["number1","number3","number4"];

    // @ts-ignore -- Typescript doesn't know that this is a mock
    recipesforArticle.mockReturnValue(Promise.resolve(fakeDbContent));

    const result = await recipesToTakeDown(ddbFakeClient, "some-article-id", fakeUpdateIds);
    expect(result).toEqual([
      {sha: "vers963", uid:"number2"},
      {sha: "vers9789", uid: "number5"}
    ]);

    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(recipesforArticle.mock.calls.length).toEqual(1);
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(recipesforArticle.mock.calls[0][0]).toEqual(ddbFakeClient);
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(recipesforArticle.mock.calls[0][1]).toEqual("some-article-id");
  });

  it("should return an empty list if there is nothing to take down", async ()=>{
    const fakeDbContent:RecipeIndexEntry[] = [
      {
        sha: "vers938",
        uid: "number1"
      },
      {
        sha: "vers346",
        uid: "number3"
      },
      {
        sha: "vers432",
        uid: "number4"
      },
    ];

    const fakeUpdateIds:string[] = ["number1","number3","number4"];

    // @ts-ignore -- Typescript doesn't know that this is a mock
    recipesforArticle.mockReturnValue(Promise.resolve(fakeDbContent));

    const result = await recipesToTakeDown(ddbFakeClient, "some-article-id", fakeUpdateIds);
    expect(result).toEqual([]);

    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(recipesforArticle.mock.calls.length).toEqual(1);
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(recipesforArticle.mock.calls[0][0]).toEqual(ddbFakeClient);
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(recipesforArticle.mock.calls[0][1]).toEqual("some-article-id");
  });

  it("should return an empty list if both input and current state are empty", async ()=>{
    const fakeDbContent:RecipeIndexEntry[] = [];

    const fakeUpdateIds:string[] = [];

    // @ts-ignore -- Typescript doesn't know that this is a mock
    recipesforArticle.mockReturnValue(Promise.resolve(fakeDbContent));

    const result = await recipesToTakeDown(ddbFakeClient, "some-article-id", fakeUpdateIds);
    expect(result).toEqual([]);

    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(recipesforArticle.mock.calls.length).toEqual(1);
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(recipesforArticle.mock.calls[0][0]).toEqual(ddbFakeClient);
    //@ts-ignore -- Typescript doesn't know that this is a mock
    expect(recipesforArticle.mock.calls[0][1]).toEqual("some-article-id");
  });
})
