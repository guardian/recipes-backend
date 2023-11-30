import type { RecipeReferenceWithoutChecksum } from './models';
import {calculateChecksum} from "./utils";

jest.mock("./config", ()=>({

}));

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
