import {
  CopyObjectCommand,
  HeadObjectCommand,
  NoSuchKey,
  S3Client,
  S3ServiceException
} from "@aws-sdk/client-s3";
import {mockClient} from "aws-sdk-client-mock";
import {sendFastlyPurgeRequestWithRetries} from "@recipes-api/lib/recipes-data";
import {
  activateCuration,
  checkCurationPath,
  doesCurationPathMatch,
  generatePath,
  generatePathFromCuration,
  newCurationPath, validateCurationData
} from "./curation";

const s3Mock = mockClient(S3Client);

jest.mock("@recipes-api/lib/recipes-data", ()=>({
  sendFastlyPurgeRequestWithRetries: jest.fn(),
}));


jest.mock("./config", ()=>({
  Bucket: "TestBucket",
  Today: new Date(2024, 1,3,8,9,10)
}));

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

describe("generatePathFromCuration", ()=>{
  it("should generate CurationPath from the provided data", ()=>{
    expect(generatePathFromCuration({
      region: "region-one",
      variant: "all-recipes",
      year: 2024,
      month: 3,
      day: 2
    })).toEqual("region-one/all-recipes/2024-03-02/curation.json")
  })
})

describe("generatePath", ()=>{
  it("should generate the curation path for the given date", ()=>{
    expect(generatePath("region-one","all-recipes",new Date(2024,2,2)))
      .toEqual("region-one/all-recipes/2024-03-02/curation.json")
  })
});

describe("doesCurationPathMatch", ()=>{
  it("should return truthy if the given date matches the CurationPath", ()=>{
    expect(doesCurationPathMatch({region: "", variant:"", year:2024,month:3,day:2}, new Date(2024,2,2)))
      .toBeTruthy();
  });

  it("should return falsy if the given date does not match the CurationPath", ()=>{
    expect(doesCurationPathMatch({region: "", variant:"", year:2024,month:3,day:2}, new Date(2024,1,5)));
  })
})

describe("newCurationPath", ()=>{
  it("should return a CurationPath for the given data", ()=>{
    expect(newCurationPath("region-one","all-recipes", new Date(2024,5,6)))
      .toEqual({
        region: "region-one",
        variant: "all-recipes",
        year: 2024,
        month: 6,
        day: 6
      });
  })
});

describe("validateCurationData", ()=> {
  beforeEach(() => {
    s3Mock.reset();
  });

  it("should return a CurationPath object if the file exists", async () => {
    s3Mock.on(HeadObjectCommand).resolves({});

    const response = await validateCurationData("some-region", "some-variant", new Date(2024, 2, 3));
    expect(s3Mock.commandCalls(HeadObjectCommand).length).toEqual(1);
    const c = s3Mock.commandCalls(HeadObjectCommand)[0];
    const arg = c.firstArg as HeadObjectCommand;
    expect(arg.input.Bucket).toEqual("TestBucket");
    expect(arg.input.Key).toEqual("some-region/some-variant/2024-03-03/curation.json");

    expect(response?.variant).toEqual("some-variant");
    expect(response?.region).toEqual("some-region");
    expect(response?.year).toEqual(2024);
    expect(response?.month).toEqual(3);
    expect(response?.day).toEqual(3);
  });

  it("should return null if the file does not exist", async () => {
    s3Mock.on(HeadObjectCommand).rejects(new NoSuchKey({$metadata: {}, message: ""}))

    const response = await validateCurationData("some-region", "some-variant", new Date(2024, 2, 3));
    expect(response).toBeNull();

    expect(s3Mock.commandCalls(HeadObjectCommand).length).toEqual(1);
    const c = s3Mock.commandCalls(HeadObjectCommand)[0];
    const arg = c.firstArg as HeadObjectCommand;
    expect(arg.input.Bucket).toEqual("TestBucket");
    expect(arg.input.Key).toEqual("some-region/some-variant/2024-03-03/curation.json");
  });

  it("should pass on any other error as an exception", async () => {
    s3Mock.on(HeadObjectCommand).rejects(new S3ServiceException({
      $fault: "server",
      name: "",
      $metadata: {},
      message: "Test exception"
    }))

    await expect(validateCurationData("some-region", "some-variant", new Date(2024, 2, 3))).rejects.toBeInstanceOf(S3ServiceException);
  });
});

describe("activateCuration", ()=>{
  beforeEach(()=>{
    s3Mock.reset();
  });

  it("should copy the given date to the default curation path", async ()=>{
    s3Mock.on(CopyObjectCommand).resolves({CopyObjectResult: {ETag: "some-etag"}});
    await activateCuration({
      region: "some-region",
      variant: "some-variant",
      year: 2023,
      month: 8,
      day: 9
    });

    expect(s3Mock.commandCalls(CopyObjectCommand).length).toEqual(1);
    const input = (s3Mock.commandCalls(CopyObjectCommand)[0].firstArg as CopyObjectCommand).input;
    expect(input.Bucket).toEqual("TestBucket");
    expect(input.CopySource).toEqual("some-region/some-variant/2023-08-09/curation.json");
    expect(input.Key).toEqual("some-region/some-variant/curation.json");

    const fastlyPurgeMocked = (sendFastlyPurgeRequestWithRetries as jest.Mock).mock.calls;
    expect(fastlyPurgeMocked.length).toEqual(1);
  });
})
