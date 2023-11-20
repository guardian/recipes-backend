import type {DeletedContent} from "@guardian/content-api-models/crier/event/v1/deletedContent";
import type {Event} from "@guardian/content-api-models/crier/event/v1/event"
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import {awaitableDelay, removeAllRecipesForArticle} from "@recipes-api/lib/recipes-data";
import {DynamoClient} from "./dynamo_conn";

export async function handleTakedown(evt:Event, attempt?:number):Promise<number> {
  if(evt.payload?.kind=="content") {  //we don't need to handle if it's not an article
    const content = evt.payload.content;
    if(content.type==ContentType.ARTICLE) {  //we don't need to handle if it's not an article
      try {
        return removeAllRecipesForArticle(DynamoClient, content.id);
      } catch(err) {
        if( (attempt ?? 0) > 10) {
          throw new Error(`Could not remove recipes for taken-down article ${content.id} after 10 attempts, giving up`);
        }
        console.error(`WARNING: Could not remove recipes for taken down article ${content.id}: `, err);
        await awaitableDelay();
        return handleTakedown(evt, (attempt ?? 0)+1)
      }
    }
  }
  return 0; //no action => nothing removed
}

// I don't think that these are relevant to us here. So, I'm logging it out to verify that suspicion
export async function handleDeletedContent(evt:DeletedContent):Promise<number> {
  console.log(`DEBUG received deleted-content-update for ${evt.aliasPaths?.join("/") ?? "(no paths)"}`)
  return Promise.resolve(0);
}
