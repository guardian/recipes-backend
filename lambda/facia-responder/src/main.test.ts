import {importCurationData} from "@recipes-api/lib/recipes-data";
import {ZodError} from "zod";
import {handler} from "./main";

jest.mock("@recipes-api/lib/recipes-data", ()=>({
  importCurationData: jest.fn()
}));

const message = {
  id: "D9AEEA41-F8DB-4FC8-A0DA-275571EA7331",
  edition: "feast-northern-hemisphere",
  version: "v1",
  issueDate: "2024-01-02",
  fronts: {
    "all-recipes": [
      {
        "id": "d353e2de-1a65-45de-85ca-d229bc1fafad",
        "title": "Dish of the day",
        "body": "",
        "items": [
          {
            "recipe": {
              "id": "14129325"
            }
          }
        ]
      }
    ],
    "meat-free": [
      {
        "id": "fa6ccb35-926b-4eff-b3a9-5d0ca88387ff",
        "title": "Dish of the day",
        "body": "",
        "items": [
          {
            "recipe": {
              "id": "14132263"
            }
          }
        ]
      }
    ]
  }
};

const rawContent = {
  Message: JSON.stringify(message)
}

describe("main", ()=>{
  it("should publish the content it was given", async ()=>{
    const rec = {
      Records: [
        {
          eventSource: "sqs",
          awsRegion: "xx-north-n",
          messageId: "BDB66A64-F095-4F4D-9B6A-135173E262A5",
          body: JSON.stringify(rawContent)
        }
      ]
    };

    // @ts-ignore
    await handler(rec, null, null);

    const importCurationDataMock = importCurationData as jest.Mock;
    expect(importCurationDataMock.mock.calls.length).toEqual(2);
    expect(importCurationDataMock.mock.calls[0][0]).toEqual(JSON.stringify(message.fronts["all-recipes"]));
    expect(importCurationDataMock.mock.calls[0][1]).toEqual(message.edition);
    expect(importCurationDataMock.mock.calls[0][2]).toEqual("all-recipes");
    expect(importCurationDataMock.mock.calls[0][3]).toEqual(new Date(2024, 0, 2));

    expect(importCurationDataMock.mock.calls[1][0]).toEqual(JSON.stringify(message.fronts["meat-free"]));
    expect(importCurationDataMock.mock.calls[1][1]).toEqual(message.edition);
    expect(importCurationDataMock.mock.calls[1][2]).toEqual("meat-free");
    expect(importCurationDataMock.mock.calls[1][3]).toEqual(new Date(2024, 0, 2));
  });


  it("should not accept valid json that does not match schema", async ()=>{
    const brokenContent = {
			...rawContent,
			Message: JSON.stringify({
				...message,
				issueDate: 'dfsdfsjk',
			}),
		};

    const rec = {
      Records: [
        {
          eventSource: "sqs",
          awsRegion: "xx-north-n",
          messageId: "BDB66A64-F095-4F4D-9B6A-135173E262A5",
          body: JSON.stringify(brokenContent)
        }
      ]
    };

    const expectedError = new ZodError([
      {
        "code": "custom",
        "fatal": true,
        "path": [
          "issueDate"
        ],
        "message": "Invalid input"
      }
    ])

    // @ts-ignore
    await expect(()=>handler(rec, null, null)).rejects.toEqual(expectedError);
  });

  it("should not accept invalid json", async ()=>{
    const rec = {
      Records: [
        {
          eventSource: "sqs",
          awsRegion: "xx-north-n",
          messageId: "BDB66A64-F095-4F4D-9B6A-135173E262A5",
          body: "blahblahblahthisisnotjson"
        }
      ]
    };

    const expectedError = new SyntaxError("Unexpected token b in JSON at position 0");
    // @ts-ignore
    await expect(()=>handler(rec, null, null)).rejects.toEqual(expectedError);
  })
})
