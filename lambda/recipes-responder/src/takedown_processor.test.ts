import type {Event} from "@guardian/content-api-models/crier/event/v1/event";
import {EventType} from "@guardian/content-api-models/crier/event/v1/eventType";
import {ItemType} from "@guardian/content-api-models/crier/event/v1/itemType";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import {AtomType} from "@guardian/content-atom-model/atomType";
import Int64 from "node-int64";
import {awaitableDelay, removeAllRecipesForArticle} from "@recipes-api/lib/recipes-data";
import {handleTakedown} from "./takedown_processor";

jest.mock("@recipes-api/lib/recipes-data", ()=>({
  awaitableDelay: jest.fn(),
  removeAllRecipesForArticle: jest.fn(),
}));

jest.mock("./dynamo_conn", ()=>({
  DynamoClient: {},
}));

describe("takedown_processor.handleTakedown", ()=>{
  beforeEach(()=>{
    jest.resetAllMocks();
  });

  it("should remove all recipes associated with the given article", async ()=>{
    const testEvt:Event = {
      payloadId: "fake-id",
      eventType: EventType.DELETE,
      itemType: ItemType.CONTENT,
      payload: {
        kind: "content",
        content: {
          id: "path/to/article/id",
          type: ContentType.ARTICLE,
          webTitle: "This is a tesT",
          webUrl: "https://some/path/to/article/id",
          apiUrl: "https://some/path/to/article/id",
          tags: [],
          references: [],
          isHosted: false,
        }
      },
      dateTime: new Int64(Date.now()),
    }

    await handleTakedown(testEvt);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeAllRecipesForArticle.mock.calls.length).toEqual(1);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(awaitableDelay.mock.calls.length).toEqual(0);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeAllRecipesForArticle.mock.calls[0][1]).toEqual("path/to/article/id");
  });

  it("should ignore anything that is not an article", async ()=>{
    const testEvt:Event = {
      payloadId: "fake-id",
      eventType: EventType.DELETE,
      itemType: ItemType.CONTENT,
      payload: {
        kind: "content",
        content: {
          id: "path/to/article/id",
          type: ContentType.GALLERY,
          webTitle: "This is a tesT",
          webUrl: "https://some/path/to/article/id",
          apiUrl: "https://some/path/to/article/id",
          tags: [],
          references: [],
          isHosted: false,
        }
      },
      dateTime: new Int64(Date.now()),
    }

    await handleTakedown(testEvt);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeAllRecipesForArticle.mock.calls.length).toEqual(0);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(awaitableDelay.mock.calls.length).toEqual(0);
  });

  it("should ignore anything that is not a 'content' payload", async ()=>{
    const testEvt:Event = {
      payloadId: "fake-id",
      eventType: EventType.DELETE,
      itemType: ItemType.ATOM,
      payload: {
        kind: "atom",
        atom: {
          id: "some-atom-id",
          atomType: AtomType.CTA,
          labels: [],
          defaultHtml: "",
          //@ts-ignore -- we are not reading this field
          data: null,
        }
      },
      dateTime: new Int64(Date.now()),
    }

    await handleTakedown(testEvt);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(removeAllRecipesForArticle.mock.calls.length).toEqual(0);
    // @ts-ignore -- Typescript doesn't know that this is a mock
    expect(awaitableDelay.mock.calls.length).toEqual(0);
  });
})
