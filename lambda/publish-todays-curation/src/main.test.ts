import {S3Client} from "@aws-sdk/client-s3";
import {mockClient} from "aws-sdk-client-mock";
import {Today} from "./config";
import type { CurationPath} from "./curation";
import { activateCuration, validateAllCuration} from "./curation";
import {handler} from "./main";

mockClient(S3Client);

jest.mock("./config", ()=>({
  Bucket: "TestBucket",
  Today: new Date(2024,1,3,11,26,19)
}));

jest.mock('./curation', ()=>{
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- recommended way to partial-mock
  const original = jest.requireActual("./curation");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- recommended way to partial-mock
  return {
    ...original,
    activateAllCurationForDate: jest.fn(),
    activateCuration: jest.fn(),
    validateAllCuration: jest.fn()
  }
});

jest.mock("@recipes-api/lib/recipes-data", ()=>({
  sendFastlyPurgeRequestWithRetries: jest.fn(),
}));

describe("main.handler", ()=>{
  beforeEach(()=>{
    jest.resetAllMocks();
  });

  it("should launch all present curations for today's date, if they are available", async ()=>{
    const availableFronts:CurationPath[] = [
      {front: "some-variant",edition:"region-one",year: 2024, month: 2, day:3},
      {front: "another-variant", edition: "region-one", year: 2024, month: 2, day: 3},
      {front: "some-variant",edition:"region-two",year: 2024, month: 2, day:3},
    ];

    (validateAllCuration as jest.Mock).mockReturnValue(Promise.resolve<CurationPath[]>(availableFronts));
    (activateCuration as jest.Mock).mockReturnValue(Promise.resolve());

    await handler({});
    const validateCalls  = (validateAllCuration as jest.Mock).mock.calls;
    expect(validateCalls.length).toEqual(1);
    expect(validateCalls[0][0]).toEqual(Today);
    expect(validateCalls[0][1]).toBeFalsy();
    const activateCalls = (activateCuration as jest.Mock).mock.calls;
    expect(activateCalls.length).toEqual(3);
    expect(activateCalls[0][0]).toEqual(availableFronts[0]);
    expect(activateCalls[1][0]).toEqual(availableFronts[1]);
    expect(activateCalls[2][0]).toEqual(availableFronts[2]);
  });

  it("should relaunch a specific curation page if it's been updated in the S3 bucket", async ()=>{
    const sampleS3Msg = {
      "Records": [
        {
          "eventVersion": "2.0",
          "eventSource": "aws:s3",
          "awsRegion": "us-east-1",
          "eventTime": "1970-01-01T00:00:00.000Z",
          "eventName": "ObjectCreated:Put",
          "userIdentity": {
            "principalId": "EXAMPLE"
          },
          "requestParameters": {
            "sourceIPAddress": "127.0.0.1"
          },
          "responseElements": {
            "x-amz-request-id": "EXAMPLE123456789",
            "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH"
          },
          "s3": {
            "s3SchemaVersion": "1.0",
            "configurationId": "testConfigRule",
            "bucket": {
              "name": "TestBucket",
              "ownerIdentity": {
                "principalId": "EXAMPLE"
              },
              "arn": "arn:aws:s3:::TestBucket"
            },
            "object": {
              "key": "region-one%2Fvariant-two%2F2024-02-03%2Fcuration.json",
              "size": 1024,
              "eTag": "0123456789abcdef0123456789abcdef",
              "sequencer": "0A1B2C3D4E5F678901"
            }
          }
        }
      ]
    };

    (activateCuration as jest.Mock).mockReturnValue(Promise.resolve());
    await handler(sampleS3Msg);

    expect((validateAllCuration as jest.Mock).mock.calls.length).toEqual(0);
    const activateCalls = (activateCuration as jest.Mock).mock.calls;
    expect(activateCalls.length).toEqual(1);
    expect(activateCalls[0][0]).toEqual({
      front: "variant-two",
      edition: "region-one",
      year: 2024,
      month: 2,
      day: 3
    });
  });

  it("should ignore Delete messages", async ()=>{
    const sampleS3Msg = {
      "Records": [
        {
          "eventVersion": "2.0",
          "eventSource": "aws:s3",
          "awsRegion": "us-east-1",
          "eventTime": "1970-01-01T00:00:00.000Z",
          "eventName": "ObjectRemoved:Delete",
          "userIdentity": {
            "principalId": "EXAMPLE"
          },
          "requestParameters": {
            "sourceIPAddress": "127.0.0.1"
          },
          "responseElements": {
            "x-amz-request-id": "EXAMPLE123456789",
            "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH"
          },
          "s3": {
            "s3SchemaVersion": "1.0",
            "configurationId": "testConfigRule",
            "bucket": {
              "name": "TestBucket",
              "ownerIdentity": {
                "principalId": "EXAMPLE"
              },
              "arn": "arn:aws:s3:::TestBucket"
            },
            "object": {
              "key": "region-one%2Fvariant-two%2F2024-02-03%2Fcuration.json",
              "size": 1024,
              "eTag": "0123456789abcdef0123456789abcdef",
              "sequencer": "0A1B2C3D4E5F678901"
            }
          }
        }
      ]
    };

    (activateCuration as jest.Mock).mockReturnValue(Promise.resolve());
    await handler(sampleS3Msg);

    expect((validateAllCuration as jest.Mock).mock.calls.length).toEqual(0);
    const activateCalls = (activateCuration as jest.Mock).mock.calls;
    expect(activateCalls.length).toEqual(0);
  });

  it("should ignore unknown paths", async ()=>{
    const sampleS3Msg = {
      "Records": [
        {
          "eventVersion": "2.0",
          "eventSource": "aws:s3",
          "awsRegion": "us-east-1",
          "eventTime": "1970-01-01T00:00:00.000Z",
          "eventName": "ObjectCreated:Put",
          "userIdentity": {
            "principalId": "EXAMPLE"
          },
          "requestParameters": {
            "sourceIPAddress": "127.0.0.1"
          },
          "responseElements": {
            "x-amz-request-id": "EXAMPLE123456789",
            "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH"
          },
          "s3": {
            "s3SchemaVersion": "1.0",
            "configurationId": "testConfigRule",
            "bucket": {
              "name": "TestBucket",
              "ownerIdentity": {
                "principalId": "EXAMPLE"
              },
              "arn": "arn:aws:s3:::TestBucket"
            },
            "object": {
              "key": "content%2Fsadfadfsjklbbncvxbxdftur",
              "size": 1024,
              "eTag": "0123456789abcdef0123456789abcdef",
              "sequencer": "0A1B2C3D4E5F678901"
            }
          }
        }
      ]
    };

    (activateCuration as jest.Mock).mockReturnValue(Promise.resolve());
    await handler(sampleS3Msg);

    expect((validateAllCuration as jest.Mock).mock.calls.length).toEqual(0);
    const activateCalls = (activateCuration as jest.Mock).mock.calls;
    expect(activateCalls.length).toEqual(0);
  });
});
