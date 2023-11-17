import type {DeletedContent} from "@guardian/content-api-models/crier/event/v1/deletedContent";
import type {Event} from "@guardian/content-api-models/crier/event/v1/event"
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import {awaitableDelay, removeAllRecipesForArticle} from "@recipes-api/lib/recipes-data";
import {DynamoClient} from "./dynamo_conn";

export async function handleTakedown(evt:Event, attempt?:number):Promise<void> {
  if(evt.payload?.kind=="content") {  //we don't need to handle if it's not an article
    const content = evt.payload.content;
    if(content.type==ContentType.ARTICLE) {  //we don't need to handle if it's not an article
      try {
        await removeAllRecipesForArticle(DynamoClient, content.id);
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
}

// eslint-disable-next-line @typescript-eslint/require-await -- not implemented yet
export async function handleDeletedContent(evt:DeletedContent):Promise<void> {

  throw new Error("handleTakedown is not implemented yet")
}
