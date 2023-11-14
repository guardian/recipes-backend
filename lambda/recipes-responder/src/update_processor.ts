import type {RetrievableContent} from "@guardian/content-api-models/crier/event/v1/retrievableContent";
import type {Content} from "@guardian/content-api-models/v1/content";
import type {PollingResult} from "@recipes-api/lib/capi";
import {callCAPI, PollingAction} from "@recipes-api/lib/capi";
import {CapiKey} from "./config";
import {ContentType} from "@guardian/content-api-models/v1/contentType";

async function retrieveContent(capiUrl:string) :Promise<PollingResult>{
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

// eslint-disable-next-line @typescript-eslint/require-await -- not implemented yet
export async function handleContentUpdate(content:Content):Promise<void>
{
  if(content.type!=ContentType.ARTICLE) return;  //no point processing live-blogs etc.

  throw new Error("handleContentUpdate not implemented yet");
}

export async function handleContentUpdateRetrievable(retrievable:RetrievableContent): Promise<void>
{
  if(retrievable.contentType!=ContentType.ARTICLE) return;  //no point processing live-blogs etc.

  const capiResponse = await retrieveContent(retrievable.capiUrl);
  switch(capiResponse.action) {
    case PollingAction.CONTENT_EXISTS:
      //Great, we have it - but should check if this has now been superceded
      if(capiResponse.content?.fields?.internalRevision ?? 0 > (retrievable.internalRevision ?? 99) ) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- it's just a logging line
        console.log(`INFO Retrievable update was superceded - we expected to see ${retrievable.internalRevision} but got ${capiResponse.content?.fields?.internalRevision}`);
      } else if(capiResponse.content) {
        return handleContentUpdate(capiResponse.content)
      } else {
        console.error("Content existed but was empty, this shouldn't happen :(")
      }
      break;
    case PollingAction.CONTENT_GONE:
    case PollingAction.CONTENT_MISSING:
      console.log(`INFO Content has gone for this update, assuming that this article was taken down in the meantime.`);
      break;
    default:
      //we throw an exception to indicate failure; the lambda runtime will then re-run us and DLQ the message if enough failures happen.
      throw new Error(`Could not handle retrievable update from CAPI: PollingAction code was ${capiResponse.action.toString()}. Allowing the lambda runtime to retry or DLQ.`);
  }
}
