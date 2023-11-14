import type {Block} from "@guardian/content-api-models/v1/block";
import {ElementType} from "@guardian/content-api-models/v1/elementType";


export interface RecipeOutput {
  recipeUId: string;
  jsonBlob: string;
  checksum?: string;
}

export function extractRecipeData(webUrl: string, block: Block): RecipeOutput[] {
  console.log("block----" + block)
  const allRecipes = block.elements
    .filter(elem => elem.type == ElementType.RECIPE)
    .map(recp => parseJsonBlob(webUrl, recp.recipeTypeData.recipeJson))

  return allRecipes
}

function parseJsonBlob(canonicalId: string, recipeJson: string): RecipeOutput {
  const recipeData = JSON.parse(recipeJson);
  if (!recipeData.id) {
    throw new Error("Error! No id present in recipeJson!")
  } else {
    return {
      recipeUId: `${canonicalId}-${recipeData.id}`,
      jsonBlob: recipeData.toString()
    }
  }
}
