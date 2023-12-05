import {getBodyContentAsJson} from "./helpers";

describe("app.getBodyContentAsJson", ()=>{
  it("should pass back a string as-is", ()=>{
    expect(getBodyContentAsJson("{\"hello\":\"test\"}")).toEqual("{\"hello\":\"test\"}");
  });

  it("should object to a string that does not parse to json", ()=>{
    expect(()=>getBodyContentAsJson("hello")).toThrow();
  })
  it("should convert an object into json string", ()=>{
    expect(getBodyContentAsJson({hello: "world"})).toEqual("{\"hello\":\"world\"}");
  });

  it("should convert an array into json string", ()=>{
    expect(getBodyContentAsJson([1,2,3])).toEqual("[1,2,3]");
  })
})
