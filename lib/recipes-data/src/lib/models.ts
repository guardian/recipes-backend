import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import formatISO from "date-fns/formatISO";
import parseISO from "date-fns/parseISO";

/**
 * RecipeIndexEntry represents a whole data record from the dynamo table containing the up-to-date index data.
 * Note that you may find it more efficient to only retrieve the fields you need rather than the whole thing.
 */
interface RecipeDatabaseEntry {
  capiArticleId: string;
  recipeUID: string;
  lastUpdated: Date;
  recipeVersion: string;
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
 * RecipeIndexEntry is a subset of the database model that is used to generate the client-facing index.
 */
export interface RecipeIndexEntry {
  sha: string;
  uid: string;
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
    sha: raw["recipeVersion"].S ?? "",
    uid: raw["recipeUid"].S ?? "",
  }
}

interface RecipeIndex {
  schemaVersion: number;
  lastUpdated: Date;
  recipes: RecipeIndexEntry[];
}

export type { RecipeDatabaseEntry,RecipeIndex };
