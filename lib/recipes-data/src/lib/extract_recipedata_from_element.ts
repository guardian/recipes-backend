import type {Block} from "@guardian/content-api-models/v1/block";
import {ElementType} from "@guardian/content-api-models/v1/elementType";
import type { RecipeReferenceWithoutChecksum } from './models';

export function extractRecipeData(canonicalId: string, block: Block): RecipeReferenceWithoutChecksum[] {
  const allRecipes = block.elements
    .filter(elem => elem.type === ElementType.RECIPE)
    .map(recp => parseJsonBlob(canonicalId, recp.recipeTypeData?.recipeJson as string))
  return allRecipes
}

function parseJsonBlob(canonicalId: string, recipeJson: string): RecipeReferenceWithoutChecksum {
  const recipeData = JSON.parse(recipeJson) as Record<string, unknown>
  if (!recipeData.id) {
    throw new Error(`Error! No id present in the recipeJson, canonicalId is ${canonicalId}`)
  } else {
    return <RecipeReferenceWithoutChecksum>{
      recipeUID: `${canonicalId}-${recipeData.id as string}`,
      jsonBlob: recipeJson
    }
  }
}
