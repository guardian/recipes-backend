/* eslint @typescript-eslint/naming-convention: "off"  -- PollingAction uses a more CAPI-like convention*/
import type {RetrievableContent} from "@guardian/content-api-models/crier/event/v1/retrievableContent";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import type { PollingResult} from "@recipes-api/lib/capi";
import {callCAPI} from "@recipes-api/lib/capi";
import {CapiKey} from "./config";
import {handleContentUpdate} from "./update_processor";

// Why are these functions in their own file? To make mocking in tests easier.

// Why can't we just import this from capi module? It appears that the info gets erased at transpile time, so we end up
//with object undefined errors at runtime :-(
export enum PollingAction {
  CONTENT_EXISTS,
  CONTENT_MISSING,
  CONTENT_GONE,
  CONCIERGE_UNHAPPY,
  INTERNAL_BUG,
  UNEXPECTED_RESPONSE,
  RATE_LIMITED
}

export async function retrieveContent(capiUrl:string) :Promise<PollingResult>{
  if(!CapiKey) {
    throw new Error("You need to set CAPI_KEY in order to make requests to CAPI");
  }

  const params = [
    `show-fields=internalRevision`,
    `show-blocks=all`,
    `show-channels=all`,
    `api-key=${CapiKey}`,
    `format=thrift`
  ].filter(v=>!!v).join("&");

  return callCAPI(`${capiUrl}?${params}`);
}

export async function handleContentUpdateRetrievable(retrievable:RetrievableContent): Promise<number>
{
  if(retrievable.contentType!=ContentType.ARTICLE) return 0;  //no point processing live-blogs etc.

  // TO FIX UPSTREAM – Crier returns a path that does not include channelled content, giving a 404
  // if the content is not on open. We modify the path manually here to fix. Crier should return a path
  // that is scoped to the appropriate channel if the content is not on open.
  const capiUrl = new URL(retrievable.capiUrl);
  const capiResponse = await retrieveContent(`${capiUrl.protocol}//${capiUrl.hostname}/channel/feast/item${capiUrl.pathname}`);

  switch(capiResponse.action) {
    case PollingAction.CONTENT_EXISTS:
      //Great, we have it - but should check if this has now been superceded
      if(capiResponse.content?.fields?.internalRevision &&
        retrievable.internalRevision &&
        capiResponse.content.fields.internalRevision > retrievable.internalRevision ) {
        console.log(`INFO Retrievable update was superceded - we expected to see ${retrievable.internalRevision} but got ${capiResponse.content.fields.internalRevision}`);
      } else if(capiResponse.content) {
        return handleContentUpdate(capiResponse.content)
      } else {
        console.error("Content existed but was empty, this shouldn't happen :(")
      }
      return 0;
    case PollingAction.CONTENT_GONE:
    case PollingAction.CONTENT_MISSING:
      //FIXME: should we invoke article-deletion here just in case?
      console.log(`INFO Content has gone for this update, assuming that this article was taken down in the meantime.`);
      return 0;
    default:
      //we throw an exception to indicate failure; the lambda runtime will then re-run us and DLQ the message if enough failures happen.
      throw new Error(`Could not handle retrievable update from CAPI: PollingAction code was ${capiResponse.action.toString()}. Allowing the lambda runtime to retry or DLQ.`);
  }
}
