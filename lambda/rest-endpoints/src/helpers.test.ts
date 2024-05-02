import {getBodyContentAsJson, validateDateParam} from "./helpers";

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

describe("app.validateDateParam", ()=>{
  it("should convert a valid date string into a Date object", ()=>{
    const result = validateDateParam("2024-06-05");
    expect(result?.getFullYear()).toEqual(2024);
    expect(result?.getMonth()).toEqual(5);  //note - JS Date() object month index is Jan=>0, Feb=1
    expect(result?.getDate()).toEqual(5);
  });

  it("should reject a malformed string", ()=>{
    expect(()=>
      validateDateParam("2014-06-05somethingmalicious")
    ).toThrow("Provided date was not valid");
  });

  it("should reject an out-of-range string", ()=>{
   expect(()=>
     validateDateParam("2024-96-05")
   ).toThrow("Invalid number of months");

    expect(()=>
      validateDateParam("1902-96-05")
    ).toThrow("Invalid year");
  });

})
