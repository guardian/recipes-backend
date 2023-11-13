import {calculateChecksum} from "./utils";
import {RecipeReference, RecipeReferenceWithoutChecksum} from "@recipes-api/lib/recipes-data";

describe("calculateChecksum", ()=>{
  it("should checksum the content into base64", ()=>{
    const input:RecipeReferenceWithoutChecksum = {
      recipeUID: "blahblah",
      jsonBlob: "foodisgoodwatchitburn"
    };
    const result = calculateChecksum(input);
    expect(result.recipeUID).toEqual(input.recipeUID);
    expect(result.jsonBlob).toEqual(input.jsonBlob);
    expect(result.checksum).toEqual("6rIHocBjte3q9jPnLtzQhtFsDabFUKQGVk3VMuorRB8")
  })
});
