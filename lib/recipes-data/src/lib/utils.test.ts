import type { RecipeReferenceWithoutChecksum } from './models';
import {calculateChecksum} from "./utils";

jest.mock("./config", ()=>({

}));

describe("calculateChecksum", ()=>{
  it("should checksum the content into base64", ()=>{
    const input:RecipeReferenceWithoutChecksum = {
      recipeUID: "blahblah",
      jsonData: {msg: "foodisgoodwatchitburn"}
    };
    const result = calculateChecksum(input);
    expect(result.recipeUID).toEqual(input.recipeUID);
    expect(result.jsonBlob).toEqual('{"msg":"foodisgoodwatchitburn"}');
    expect(result.checksum).toEqual("6ev4GHjOZEoa3L-iznZI64gFJozVpwBYjmFsAVEE4UY")
  })
});
