import type {AttributeValue} from "@aws-sdk/client-dynamodb";
import {RecipeIndexEntryFromDynamo} from "./models";

describe("RecipeIndexEntryFromDynamo", ()=>{
  it("should correctly parse a record with sponorship data", ()=>{
    const rec:Record<string, AttributeValue> = {
      "capiArticleId": {
        "S": "lifeandstyle/article/2024/aug/19/testing-sponsor-article-for-v2"
      },
      "recipeUID": {
        "S": "714c4bce-564d-4df6-b03b-9e71599d58a2"
      },
      "lastUpdated": {
        "S": "2024-08-19T09:03:48Z"
      },
      "recipeVersion": {
        "S": "USCVJcb1xwRxTG2RFoYSrpBukTe71ZUm6uZNdvFU_bA"
      },
      "sponsorshipCount": {
        "N": "1"
      }
    };

    const result = RecipeIndexEntryFromDynamo(rec);
    expect(result.sponsorshipCount).toEqual(1);
    expect(result.capiArticleId).toEqual("lifeandstyle/article/2024/aug/19/testing-sponsor-article-for-v2");
    expect(result.recipeUID).toEqual("714c4bce-564d-4df6-b03b-9e71599d58a2");
    expect(result.checksum).toEqual("USCVJcb1xwRxTG2RFoYSrpBukTe71ZUm6uZNdvFU_bA");
  })
})
