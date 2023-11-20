import type {Content} from "@guardian/content-api-models/v1/content";
import type {RecipeReferenceWithoutChecksum} from "./lib/models";

export * from './lib/models';
export * from './lib/dynamo';
export * from './lib/takedown';
export * from './lib/s3';

//FIXME temporary stub function, don't merge
export async function extractAllRecipesFromArticle(content:Content):Promise<RecipeReferenceWithoutChecksum[]> {
  return Promise.reject(new Error("extractAllRecipesFromArticle is not implemented yet"));
}

export {awaitableDelay, calculateChecksum} from './lib/utils';
