import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import {formatISO, parseISO} from "date-fns";

/**
 * This is a proposed schema update that should come into effect in Jan '24 for a more structured
 * representation in the `contributors` array
 */
export type ContributorChef = {
  type: "text";
  text: string;
} | {
  type: "tag";
  tagId: string;
}

/**
 * RecipeDatabaseKey contains the fields necessary to uniquely identify a recipe in the index
 */
interface RecipeDatabaseKey {
  capiArticleId: string;
  recipeUID: string;
}

/**
 * RecipeIndexEntry represents a whole data record from the dynamo table containing the up-to-date index data.
 * Note that you may find it more efficient to only retrieve the fields you need rather than the whole thing.
 */
interface RecipeDatabaseEntry extends RecipeDatabaseKey{
  lastUpdated: Date;
  recipeVersion: string;
}

/**
 * RecipeIndexEntry is a subset of the database model that is used to generate the client-facing index.
 */
export interface RecipeIndexEntry {
  checksum: string;
  recipeUID: string;
}

export function RecipeDatabaseEntryToIndex(from:RecipeDatabaseEntry):RecipeIndexEntry
{
  return {
    checksum: from.recipeVersion,
    recipeUID: from.recipeUID,
  }
}
/**
 * RecipeIndex is the shape of the data that is sent out as the recipe index, containing an array of RecipeIndexEntry
 */
interface RecipeIndex {
  schemaVersion: number;
  lastUpdated: Date;
  recipes: RecipeIndexEntry[];
}

/**
 * RecipeReferenceWithoutChecksum is complementary to RecipeIndexEntry, where we have a UID and json blob but
 * no checksum yet. This is obtained from an incoming article.
 */
interface RecipeReferenceWithoutChecksum {
  recipeUID: string;
  jsonData: Record<string, unknown>;
}

/**
 * RecipeReference has all three main constituents for a recipe - the immutable ID, the version ID and the json content
 */
interface RecipeReference extends Omit<RecipeReferenceWithoutChecksum, "jsonData">{
  checksum: string;
  jsonBlob: string;
}

/**
 * Helper function to un-marshal a raw dynamo record into a RecipeDatabaseEntry structure.
 * Note, this will not throw if the fields are not present; instead, capiArticleId will be an empty string ("")
 * @param raw - record to unmarshal, from the Dynamo API
 * @return a RecipeDatabaseEntry
 */
export function RecipeDatabaseEntryFromDynamo(raw: Record<string, AttributeValue>): RecipeDatabaseEntry {
  return {
    capiArticleId: raw["capiArticleId"].S ?? "",
    recipeUID: raw["recipeUID"].S ?? "",
    lastUpdated: raw["lastUpdated"].S ? parseISO(raw["lastUpdated"].S) : new Date(1970, 0, 0),
    recipeVersion: raw["recipeVersion"].S ?? "",
  };
}

/**
 * Helper function to marshal a RecipeDatabaseEntry structure into a raw dynamo record.
 * @param ent - a RecipeDatabaseEntry
 * @return a record suitable for pushing to the Dynamo API
 */
export function RecipeDatabaseEntryToDynamo(ent: RecipeDatabaseEntry): Record<string, AttributeValue> {
  return {
    capiArticleId: {S: ent.capiArticleId},
    recipeUID: {S: ent.recipeUID},
    lastUpdated: {S: formatISO(ent.lastUpdated) },
    recipeVersion: {S: ent.recipeVersion }
  }
}

/**
 * Helper function to convert a raw dynamo record into the RecipeIndexEntry subset.
 * Prefer to use this over the more complete RecipeDatabaseEntryFromDynamo if you don't
 * need to get the entire data model. Specifically, we ignore timestamps; so there is no
 * point spending time parsing and validating the timestamp if it's going to be dropped.
 * @param raw - a raw Dynamo record from the API
 * @return a RecipeIndexEntry subset record
 */
export function RecipeIndexEntryFromDynamo(raw:Record<string, AttributeValue>): RecipeIndexEntry {
  return {
    checksum: raw["recipeVersion"].S ?? "",
    recipeUID: raw["recipeUID"].S ?? "",
  }
}


/**
 * Helper function to generate a full recipe reference structure from and index entry.
 * In order to do this, you need to supply the json content of the recipe.
 * @param entry RecipeIndexEntry to upgrade
 * @param jsonBlob the json content to add to it
 */
export function recipeReferenceFromIndexEntry(entry: RecipeIndexEntry, jsonBlob:string):RecipeReference
{
  return {...entry, jsonBlob}
}

export type { RecipeDatabaseKey, RecipeDatabaseEntry,RecipeIndex, RecipeReference, RecipeReferenceWithoutChecksum };
