import type {RetrievableContent} from "@guardian/content-api-models/crier/event/v1/retrievableContent";
import type {Content} from "@guardian/content-api-models/v1/content";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import {callCAPI, PollingAction} from "@recipes-api/lib/capi";
import type {PollingResult} from "@recipes-api/lib/capi";
import type {RecipeReference} from "@recipes-api/lib/recipes-data";
import {
  calculateChecksum,
  extractAllRecipesFromArticle,
  insertNewRecipe,
  publishRecipeContent,
  recipesToTakeDown,
  removeRecipeVersion
} from "@recipes-api/lib/recipes-data";
import {CapiKey} from "./config";
import {DynamoClient} from "./dynamo_conn";

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

/**
 * Pushes new content into the service
 * @param canonicalArticleId
 * @param recep
 */
async function publishRecipe(canonicalArticleId:string, recep:RecipeReference):Promise<void>
{
  console.log(`INFO [${canonicalArticleId}] - pushing ${recep.recipeUID} @ ${recep.checksum} to S3...`);
  await publishRecipeContent(recep);
  console.log(`INFO [${canonicalArticleId}] - updating index table...`);
  await insertNewRecipe(DynamoClient, canonicalArticleId, {recipeUID: recep.recipeUID, checksum: recep.checksum});
}

/**
 * Takes an updated article and updates any recipes from inside it
 * @param content - Content of an incoming article
 * @returns a number, representing the number of recipes that were updated
 */
export async function handleContentUpdate(content:Content):Promise<number>
{
  if(content.type!=ContentType.ARTICLE) return 0;  //no point processing live-blogs etc.

  const allRecipes:RecipeReference[] = (await extractAllRecipesFromArticle(content)).map(calculateChecksum);
  console.log(`INFO [${content.id}] - has ${allRecipes.length} recipes`);
  if(allRecipes.length==0) return 0;  //no point hanging around and noising up the logs

  const entriesToRemove = await recipesToTakeDown(DynamoClient, content.id, allRecipes.map(recep=>recep.recipeUID));
  console.log(`INFO [${content.id}] - ${entriesToRemove.length} recipes have been removed/superceded`);
  entriesToRemove.map(recep=>removeRecipeVersion(DynamoClient, content.id, recep));

  console.log(`INFO [${content.id}] - publishing ${allRecipes.length} recipes to the service`)
  await Promise.all(allRecipes.map(recep=>publishRecipe(content.id, recep)))

  console.log(`INFO [${content.id}] - Done`);
  return allRecipes.length;
}

export async function handleContentUpdateRetrievable(retrievable:RetrievableContent): Promise<number>
{
  if(retrievable.contentType!=ContentType.ARTICLE) return 0;  //no point processing live-blogs etc.

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
