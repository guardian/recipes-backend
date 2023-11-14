import type {Block} from "@guardian/content-api-models/v1/block";
import {ElementType} from "@guardian/content-api-models/v1/elementType";


export interface RecipeOutput {
  recipeUId: string;
  jsonBlob: string;
  checksum?: string;
}

export function extractRecipeData(webUrl: string, block: Block): RecipeOutput[] {
  const allRecipes = block.elements.filter(elem => elem.type === ElementType.RECIPE)
  if (allRecipes.length != 0) {
    return allRecipes.map(recp => parseJsonBlob(webUrl, recp.recipeTypeData?.recipeJson))
  } else {
    throw new Error("Error! No recipe is present in elements!")
  }
}

function parseJsonBlob(canonicalId: string, recipeJson: string | undefined): RecipeOutput {
  const recipeData = JSON.parse(recipeJson as string) as Record<string, unknown>
  if (!recipeData.id) {
    throw new Error("Error! No id present in recipeJson!")
  } else {
    return <RecipeOutput>{
      recipeUId: `${canonicalId}-${recipeData.id as string}`,
      jsonBlob: JSON.stringify(recipeData)
    }
  }
}
