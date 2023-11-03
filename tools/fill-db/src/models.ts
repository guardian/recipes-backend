import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import formatISO from "date-fns/formatISO";
import parseISO from "date-fns/parseISO";

interface RecipeIndexEntry {
  capiArticleId: string;
  recipeUID: string;
  lastUpdated: Date;
  recipeVersion: string;
}

export function RecipeIndexEntryFromDynamo(raw: Record<string, AttributeValue>): RecipeIndexEntry {
  return {
    capiArticleId: raw["capiArticleId"].S ?? "",
    recipeUID: raw["recipeUID"].S ?? "",
    lastUpdated: raw["lastUpdated"].S ? parseISO(raw["lastUpdated"].S) : new Date(1970, 0, 0),
    recipeVersion: raw["recipeVersion"].S ?? "",
  };
}

export function RecipeIndexEntryToDynamo(ent: RecipeIndexEntry): Record<string, AttributeValue> {
  return {
    capiArticleId: {S: ent.capiArticleId},
    recipeUID: {S: ent.recipeUID},
    lastUpdated: {S: formatISO(ent.lastUpdated) },
    recipeVersion: {S: ent.recipeVersion }
  }
}

export type { RecipeIndexEntry };
