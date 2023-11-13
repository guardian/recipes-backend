import {calculateChecksum} from "./utils";
import {RecipeReference} from "@recipes-api/lib/recipes-data";

describe("calculateChecksum", ()=>{
  it("should throw an error if the checksum field is already set", ()=>{
    expect(()=>calculateChecksum({recipeUID: "blahblah", jsonBlob: "foodisgoodwatchitburn", checksum: "something-here"}))
      .toThrow(new Error("Asked to checksum blahblah which already had a checksum"));
  });

  it("should checksum the content into base64", ()=>{
    const input:RecipeReference = {
      recipeUID: "blahblah",
      jsonBlob: "foodisgoodwatchitburn"
    };
    const result = calculateChecksum(input);
    expect(result.recipeUID).toEqual(input.recipeUID);
    expect(result.jsonBlob).toEqual(input.jsonBlob);
    expect(result.checksum).toEqual("6rIHocBjte3q9jPnLtzQhtFsDabFUKQGVk3VMuorRB8")
  })
});
