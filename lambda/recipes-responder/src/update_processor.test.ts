import type {Content} from "@guardian/content-api-models/v1/content";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import type {
  RecipeIndexEntry,
  RecipeReferenceWithoutChecksum} from "@recipes-api/lib/recipes-data";
import {
  calculateChecksum,
  extractAllRecipesFromArticle,
  insertNewRecipe,
  publishRecipeContent,
  recipesToTakeDown,
  removeRecipeVersion
} from "@recipes-api/lib/recipes-data";
import {handleContentUpdate} from "./update_processor";

jest.mock("node-fetch", ()=>({
  __esmodule: true,
  default: jest.fn()
}));

jest.mock("./dynamo_conn", ()=>({
  DynamoClient: {},
}));

jest.mock("@recipes-api/lib/recipes-data", ()=>({
  calculateChecksum: jest.fn(),
  extractAllRecipesFromArticle: jest.fn(),
  insertNewRecipe: jest.fn(),
  publishRecipeContent: jest.fn(),
  recipesToTakeDown: jest.fn(),
  removeRecipeVersion: jest.fn(),
}));

const fakeContent:Content = {
  apiUrl: "api://path/to/content",
  id: "path/to/content",
  isHosted: false,
  references: [],
  tags: [],
  type: ContentType.ARTICLE,
  webTitle: "Test Article",
  webUrl: "web://path/to/content"
}

describe("update_processor.handleContentUpdate", ()=>{
  beforeEach(()=>{
    jest.resetAllMocks();
  });

  it("should extract recipes from the content, publish those and take-down any that were no longer needed", async ()=>{
    const refsInArticle:RecipeReferenceWithoutChecksum[] = [
      { recipeUID: "uid-recep-1", jsonBlob: ""},
      { recipeUID: "uid-recep-2", jsonBlob: ""},
      { recipeUID: "uid-recep-3", jsonBlob: ""},
    ];

    const refsToRemove:RecipeIndexEntry[] = [
      { recipeUID: "uid-recep-2", checksum: "xxxyyyzzz"},
      { recipeUID: "uid-recep-4", checksum: "zzzyyyqqq"}
    ];

    // @ts-ignore -- Typescript doesn't know that this is a mock
    extractAllRecipesFromArticle.mockReturnValue(refsInArticle);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    recipesToTakeDown.mockReturnValue(refsToRemove);

    calculateChecksum
      // @ts-ignore -- Typescript doesn't know that this is a mock
      .mockReturnValueOnce({ recipeUID: "uid-recep-1", jsonBlob: "", checksum: "abcd1"})
      // @ts-ignore -- Typescript doesn't know that this is a mock
      .mockReturnValueOnce({ recipeUID: "uid-recep-2", jsonBlob: "", checksum: "efgh"})
      // @ts-ignore -- Typescript doesn't know that this is a mock
      .mockReturnValueOnce({ recipeUID: "uid-recep-3", jsonBlob: "", checksum: "xyzp"});

    await handleContentUpdate(fakeContent);

    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(extractAllRecipesFromArticle.mock.calls.length).toEqual(1);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(calculateChecksum.mock.calls.length).toEqual(3);

    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(insertNewRecipe.mock.calls.length).toEqual(3);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(insertNewRecipe.mock.calls[0][1]).toEqual("path/to/content");  //canonical article ID
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(insertNewRecipe.mock.calls[0][2]).toEqual({checksum: "abcd1", recipeUID: "uid-recep-1"});  //recipe data
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(insertNewRecipe.mock.calls[1][1]).toEqual("path/to/content");  //canonical article ID
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(insertNewRecipe.mock.calls[1][2]).toEqual({checksum: "efgh", recipeUID: "uid-recep-2"});  //recipe data
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(insertNewRecipe.mock.calls[2][1]).toEqual("path/to/content");  //canonical article ID
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(insertNewRecipe.mock.calls[2][2]).toEqual({checksum: "xyzp", recipeUID: "uid-recep-3"});  //recipe data

    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(publishRecipeContent.mock.calls.length).toEqual(3);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(publishRecipeContent.mock.calls[0][0]).toEqual({recipeUID: "uid-recep-1", checksum:"abcd1", jsonBlob: ""});
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(publishRecipeContent.mock.calls[1][0]).toEqual({recipeUID: "uid-recep-2", checksum:"efgh", jsonBlob: ""});
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(publishRecipeContent.mock.calls[2][0]).toEqual({recipeUID: "uid-recep-3", checksum:"xyzp", jsonBlob: ""});

    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeVersion.mock.calls.length).toEqual(2);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeVersion.mock.calls[0][1]).toEqual("path/to/content");
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeVersion.mock.calls[0][2]).toEqual({checksum: "xxxyyyzzz", recipeUID: "uid-recep-2"});
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeVersion.mock.calls[1][1]).toEqual("path/to/content");
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeVersion.mock.calls[1][2]).toEqual({checksum: "zzzyyyqqq", recipeUID: "uid-recep-4"});
  });

  it("should ignore a piece of content that is not an article", async ()=>{
    const refsInArticle:RecipeReferenceWithoutChecksum[] = [
      { recipeUID: "uid-recep-1", jsonBlob: ""},
      { recipeUID: "uid-recep-2", jsonBlob: ""},
      { recipeUID: "uid-recep-3", jsonBlob: ""},
    ];

    const refsToRemove:RecipeIndexEntry[] = [
      { recipeUID: "uid-recep-2", checksum: "xxxyyyzzz"},
      { recipeUID: "uid-recep-4", checksum: "zzzyyyqqq"}
    ];

    // @ts-ignore -- Typescript doesn't know that this is a mock
    extractAllRecipesFromArticle.mockReturnValue(Promise.resolve(refsInArticle));
    // @ts-ignore -- Typescript doesn't know that this is a mock
    recipesToTakeDown.mockReturnValue(refsToRemove);

    calculateChecksum
      // @ts-ignore -- Typescript doesn't know that this is a mock
      .mockReturnValueOnce({ recipeUID: "uid-recep-1", jsonBlob: "", checksum: "abcd1"})
      // @ts-ignore -- Typescript doesn't know that this is a mock
      .mockReturnValueOnce({ recipeUID: "uid-recep-2", jsonBlob: "", checksum: "efgh"})
      // @ts-ignore -- Typescript doesn't know that this is a mock
      .mockReturnValueOnce({ recipeUID: "uid-recep-3", jsonBlob: "", checksum: "xyzp"});

    await handleContentUpdate({...fakeContent, type: ContentType.GALLERY});

    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(extractAllRecipesFromArticle.mock.calls.length).toEqual(0);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(calculateChecksum.mock.calls.length).toEqual(0);

    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(insertNewRecipe.mock.calls.length).toEqual(0);

    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(publishRecipeContent.mock.calls.length).toEqual(0);

    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeVersion.mock.calls.length).toEqual(0);
  });

  it("should be fine if there is no recipe content", async ()=>{
    const refsInArticle:RecipeReferenceWithoutChecksum[] = [];

    const refsToRemove:RecipeIndexEntry[] = [];

    // @ts-ignore -- Typescript doesn't know that this is a mock
    extractAllRecipesFromArticle.mockReturnValue(refsInArticle);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    recipesToTakeDown.mockReturnValue(refsToRemove);

    await handleContentUpdate(fakeContent);

    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(extractAllRecipesFromArticle.mock.calls.length).toEqual(1);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(calculateChecksum.mock.calls.length).toEqual(0);

    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(insertNewRecipe.mock.calls.length).toEqual(0);

    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(publishRecipeContent.mock.calls.length).toEqual(0);

    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeRecipeVersion.mock.calls.length).toEqual(0);
  });
});
