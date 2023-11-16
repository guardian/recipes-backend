import type {Block} from "@guardian/content-api-models/v1/block";
import {ElementType} from "@guardian/content-api-models/v1/elementType";


export interface RecipeOutput {
  recipeUId: string;
  jsonBlob: string;
  checksum?: string;
}

export function extractRecipeData(canonicalId: string, block: Block): RecipeOutput[] {
  const allRecipes = block.elements
    .filter(elem => elem.type === ElementType.RECIPE)
    .map(recp => parseJsonBlob(canonicalId, recp.recipeTypeData?.recipeJson as string))
  return allRecipes
}

function parseJsonBlob(canonicalId: string, recipeJson: string): RecipeOutput {
  const recipeData = JSON.parse(recipeJson) as Record<string, unknown>
  if (!recipeData.id) {
    throw new Error(`Error! No id present in the recipeJson, canonicalId is ${canonicalId}`)
  } else {
    return <RecipeOutput>{
      recipeUId: `${canonicalId}-${recipeData.id as string}`,
      jsonBlob: recipeJson
    }
  }
}
