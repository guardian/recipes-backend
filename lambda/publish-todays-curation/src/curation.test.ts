import {checkCurationPath} from "./curation";

describe("curation.checkCurationPath", ()=>{
  it("should extract data from a proper path", ()=>{
    const result = checkCurationPath("northern-area/all-recipes/2020-01-02/curation.json");
    expect(result?.region).toEqual("northern-area");
    expect(result?.variant).toEqual("all-recipes");
    expect(result?.year).toEqual(2020);
    expect(result?.month).toEqual(1);
    expect(result?.day).toEqual(2);
  });

  it("should return null for an unrecognised path", ()=>{
    const result = checkCurationPath("content/jkhdfsdsfFfiodfsds");
    expect(result).toBeNull();
  })
})
