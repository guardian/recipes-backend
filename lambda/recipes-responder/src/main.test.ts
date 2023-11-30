import type {Event} from "@guardian/content-api-models/crier/event/v1/event";
import {EventType} from "@guardian/content-api-models/crier/event/v1/eventType";
import {ItemType} from "@guardian/content-api-models/crier/event/v1/itemType";
import type {Content} from "@guardian/content-api-models/v1/content";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import type {KinesisStreamRecord} from "aws-lambda";
import formatISO from "date-fns/formatISO";
import {deserializeEvent} from "@recipes-api/lib/capi";
import {processRecord} from "./main";
import {handleDeletedContent, handleTakedown} from "./takedown_processor";
import {handleContentUpdate} from "./update_processor";
import {handleContentUpdateRetrievable} from "./update_retrievable_processor";

jest.mock("node-fetch", ()=>({
  __esmodule: true,
  default: jest.fn(),
}));

jest.mock("@recipes-api/lib/capi", ()=>({
  deserializeEvent: jest.fn(),
}));

jest.mock("./takedown_processor", ()=>({
  handleTakedown: jest.fn(),
  handleDeletedContent: jest.fn(),
}));

jest.mock("./update_processor", ()=>({
  handleContentUpdate: jest.fn(),
}));

jest.mock("./update_retrievable_processor", ()=>({
  handleContentUpdateRetrievable: jest.fn(),
}));

jest.mock("@recipes-api/lib/recipes-data", ()=>({

}));

describe("main.processRecord", ()=>{
  beforeEach(()=>{
    jest.resetAllMocks();
  });

  //@ts-ignore
  const testReq:KinesisStreamRecord = {
    //@ts-ignore
    kinesis: {
      data: "base64-would-be-here"
    }
  }

  const testContent:Content = {
    apiUrl: "", id: "", isHosted: false, references: [], tags: [], type: ContentType.ARTICLE, webTitle: "", webUrl: ""
  }

  it("should pass a DELETE event to handleTakedown", async ()=>{
    const nowtime = new Date();

    const testEvent:Event = {
      //@ts-ignore
      dateTime: nowtime.valueOf(),
      eventType: EventType.DELETE,
      itemType: ItemType.CONTENT,
      payloadId: "xxxxxxxxxx",
      payload: {
        content: testContent,
        kind: "content"
      }
    }

    //@ts-ignore
    deserializeEvent.mockReturnValue(testEvent);
    //@ts-ignore
    await processRecord(testReq);
    //@ts-ignore
    expect(handleTakedown.mock.calls.length).toEqual(1);
    //@ts-ignore
    expect(handleTakedown.mock.calls[0][0]).toEqual(testEvent);
    //@ts-ignore
    expect(handleContentUpdate.mock.calls.length).toEqual(0);
    //@ts-ignore
    expect(handleContentUpdateRetrievable.mock.calls.length).toEqual(0);
    //@ts-ignore
    expect(handleDeletedContent.mock.calls.length).toEqual(0);
  });

  it("should pass an UPDATE event to handleUpdate", async ()=>{
    const nowtime = new Date();

    const testEvent:Event = {
      //@ts-ignore
      dateTime: nowtime.valueOf(),
      eventType: EventType.UPDATE,
      itemType: ItemType.CONTENT,
      payloadId: "xxxxxxxxxx",
      payload: {
        content: testContent,
        kind: "content"
      }
    }

    //@ts-ignore
    deserializeEvent.mockReturnValue(testEvent);
    //@ts-ignore
    const result = await processRecord(testReq);
    //@ts-ignore
    expect(handleTakedown.mock.calls.length).toEqual(0);
    //@ts-ignore
    expect(handleContentUpdate.mock.calls.length).toEqual(1);
    //@ts-ignore
    expect(handleContentUpdate.mock.calls[0][0]).toEqual(testContent)
    //@ts-ignore
    expect(handleContentUpdateRetrievable.mock.calls.length).toEqual(0);
    //@ts-ignore
    expect(handleDeletedContent.mock.calls.length).toEqual(0);
  });

  it("should pass an RETRIEVABLE_UPDATE event to handleRetrievableUpdate", async ()=>{
    const nowtime = new Date();

    const testEvent:Event = {
      //@ts-ignore
      dateTime: nowtime.valueOf(),
      eventType: EventType.RETRIEVABLEUPDATE,
      itemType: ItemType.CONTENT,
      payloadId: "xxxxxxxxxx",
      payload: {
        retrievableContent: {
          id: "test",
          capiUrl: "/path/to/test"
        },
        kind: "retrievableContent"
      }
    }

    //@ts-ignore
    deserializeEvent.mockReturnValue(testEvent);
    //@ts-ignore
    const result = await processRecord(testReq);
    //@ts-ignore
    expect(handleTakedown.mock.calls.length).toEqual(0);
    //@ts-ignore
    expect(handleContentUpdate.mock.calls.length).toEqual(0);
    //@ts-ignore
    expect(handleContentUpdateRetrievable.mock.calls.length).toEqual(1);
    //@ts-ignore
    expect(handleContentUpdateRetrievable.mock.calls[0][0]).toEqual({id: "test", capiUrl: "/path/to/test"});
    //@ts-ignore
    expect(handleDeletedContent.mock.calls.length).toEqual(0);
  });

  it("should pass an UPDATE event with DeletedContent payload to handleDeletedContent", async ()=>{
    const nowtime = new Date();

    const testEvent:Event = {
      //@ts-ignore
      dateTime: nowtime.valueOf(),
      eventType: EventType.RETRIEVABLEUPDATE,
      itemType: ItemType.CONTENT,
      payloadId: "xxxxxxxxxx",
      payload: {
        deletedContent: {
          aliasPaths: [{path: "/some/path", ceasedToBeCanonicalAt: {
            //@ts-ignore
            dateTime: nowtime.valueOf(),
              iso8601: formatISO(nowtime)
          }
          }]
        },
        kind: "deletedContent"
      }
    }

    //@ts-ignore
    deserializeEvent.mockReturnValue(testEvent);
    //@ts-ignore
    const result = await processRecord(testReq);
    //@ts-ignore
    expect(handleTakedown.mock.calls.length).toEqual(0);
    //@ts-ignore
    expect(handleContentUpdate.mock.calls.length).toEqual(0);
    //@ts-ignore
    expect(handleContentUpdateRetrievable.mock.calls.length).toEqual(0);
    //@ts-ignore
    expect(handleDeletedContent.mock.calls.length).toEqual(1);
    //@ts-ignore
    expect(handleDeletedContent.mock.calls[0][0]).toEqual({
      aliasPaths: [{path: "/some/path", ceasedToBeCanonicalAt: {
          //@ts-ignore
          dateTime: nowtime.valueOf(),
          iso8601: formatISO(nowtime)
        }
      }]
    });
  });

  it("should pass a DELETE event to handleTakedown", async ()=>{
    const nowtime = new Date();

    const testEvent:Event = {
      //@ts-ignore
      dateTime: nowtime.valueOf(),
      eventType: EventType.DELETE,
      itemType: ItemType.CONTENT,
      payloadId: "xxxxxxxxxx",
      payload: {
        content: testContent,
        kind: "content"
      }
    }

    //@ts-ignore
    deserializeEvent.mockReturnValue(testEvent);
    //@ts-ignore
    await processRecord(testReq);
    //@ts-ignore
    expect(handleTakedown.mock.calls.length).toEqual(1);
    //@ts-ignore
    expect(handleTakedown.mock.calls[0][0]).toEqual(testEvent);
    //@ts-ignore
    expect(handleContentUpdate.mock.calls.length).toEqual(0);
    //@ts-ignore
    expect(handleContentUpdateRetrievable.mock.calls.length).toEqual(0);
    //@ts-ignore
    expect(handleDeletedContent.mock.calls.length).toEqual(0);
  });

  it("should ignore an UPDATE event for an atom", async ()=>{
    const nowtime = new Date();

    const testEvent:Event = {
      //@ts-ignore
      dateTime: nowtime.valueOf(),
      eventType: EventType.UPDATE,
      itemType: ItemType.ATOM,
      payloadId: "xxxxxxxxxx",
      payload: {
        content: testContent,
        kind: "content"
      }
    }

    //@ts-ignore
    deserializeEvent.mockReturnValue(testEvent);
    //@ts-ignore
    const result = await processRecord(testReq);
    expect(result).toEqual(0);
    //@ts-ignore
    expect(handleTakedown.mock.calls.length).toEqual(0);
    //@ts-ignore
    expect(handleContentUpdate.mock.calls.length).toEqual(0);
    //@ts-ignore
    expect(handleContentUpdateRetrievable.mock.calls.length).toEqual(0);
    //@ts-ignore
    expect(handleDeletedContent.mock.calls.length).toEqual(0);
  });
});
