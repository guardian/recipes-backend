import { AttributeValue } from "@aws-sdk/client-dynamodb";
import parseISO from "date-fns/parseISO";
import formatISO from "date-fns/formatISO";

interface RecipeIndexEntry {
  capiArticleId: string;
  recipeUID: string;
  lastUpdated: Date;
  recipeVersion: string;
}

export function RecipeIndexEntryFromDynamo(raw: Record<string, AttributeValue>): RecipeIndexEntry {
  return {
    capiArticleId: raw["capiArticleId"].S,
    recipeUID: raw["recipeUID"].S,
    lastUpdated: parseISO(raw["lastUpdated"].S),
    recipeVersion: raw["recipeVersion"].S,
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
