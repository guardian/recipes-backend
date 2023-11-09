import {mockClient} from "aws-sdk-client-mock";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException
} from "@aws-sdk/client-s3";
import {publishRecipeContent} from "./s3";
import {MaximumRetries} from "./config";
import {awaitableDelay} from "./utils";

const s3Mock = mockClient(S3Client);

jest.mock("./config", ()=>({
  StaticBucketName: "contentbucket",
  MaximumRetries: 5
}));

jest.mock("./utils", ()=>({
  awaitableDelay: jest.fn(),
}));

describe("s3.publishRecipeContent", ()=>{
  beforeEach(()=>{
    s3Mock.reset();
    jest.resetAllMocks();
  });

  it("should upload the given content to S3 with correct headers", async ()=>{
    //TODO once Fastly is on this branch, assert that we purge the cache
    s3Mock.on(PutObjectCommand).resolves({});

    await publishRecipeContent({
      recipeUID: "some-uid-here",
      jsonBlob: "this-is-json",
      checksum: "xxxyyyzzz"
    });

    expect(s3Mock.calls().length).toEqual(1);
    const uploadArgs = s3Mock.call(0).firstArg as PutObjectCommand;
    expect(uploadArgs.input.Body).toEqual("this-is-json");
    expect(uploadArgs.input.Key).toEqual(`content/xxxyyyzzz`);
    expect(uploadArgs.input.ChecksumSHA256).toEqual("xxxyyyzzz");
    expect(uploadArgs.input.Bucket).toEqual("contentbucket");
    expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
  });

  it("should retry up to MaximumRetries then throw the error", async()=>{
    // @ts-ignore -- the S3ServiceException is malformed, but we are not reading the data anyway.
    s3Mock.on(PutObjectCommand).rejects(new S3ServiceException({$fault: "client", $metadata: undefined, name: "test"}));

    // @ts-ignore -- typescript doesn't know that this is a mock
    awaitableDelay.mockReturnValue(Promise.resolve());

    await expect(publishRecipeContent({
      recipeUID: "some-uid-here",
      jsonBlob: "this-is-json",
      checksum: "xxxyyyzzz"
    })).rejects.toThrow();

    expect(s3Mock.calls().length).toEqual(MaximumRetries);
    expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
    // @ts-ignore - typescript doesn't know that this is a mock
    expect(awaitableDelay.mock.calls.length).toEqual(MaximumRetries-1); //on the last send, we don't wait but throw immediately
  })
});
