import {ElementType} from "@guardian/content-api-models/v1/elementType";
import {Block} from "@guardian/content-api-models/v1/block";

interface recipeDataOutput{
  UId: string;
  jsonData: string
  checksum?: string;
}

export function extractRecipeData(webUrl: string, block: Block):recipeDataOutput[] {
  try {
    const allRecipes = block.elements
      .filter(elem => elem.type == ElementType.RECIPE)
      .map(recp => parseJsonBlob(webUrl, recp.recipeTypeData.recipeJson))

    return allRecipes
  }catch(error){
    console.log("Error in getting recipes " + error)
  }
}

private function parseJsonBlob(canonicalId:string, recipeJson:string):recipeDataOutput {
  const recipeData = JSON.parse(recipeJson)
  if(!recipeData.id)
    throw new Error("Error! No id present in recipeJson!")
  else return {
    UId:`${canonicalId}-${recipeData.id}`,
    jsonData: recipeData.toString()
  }
}
