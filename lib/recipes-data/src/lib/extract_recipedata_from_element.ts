import {ElementType} from "@guardian/content-api-models/v1/elementType";
import {Content} from "@guardian/content-api-models/v1/content";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import {ItemType} from "@guardian/content-api-models/crier/event/v1/itemType";
import {Block} from "@guardian/content-api-models/v1/block";
import {RecipeElementFields} from "@guardian/content-api-models/v1/recipeElementFields";

// needs to output a custom type containing:
// the computed UID for the recipe
//   (defined as ${canonicalArticleId}-${recipe.id}, where ${recipe.id} is the value of the id field at the root of the recipe JSON
// the entire json blob as a string
// an empty optional field to hold the checksum
interface recipeDataOutput{
  UId: string;
  jsonData: string
  checksum?: string;
}

// TODO: Failures:
// should throw an exception of the type Error("error message");
// should fail if the Element in question is not a recipe
// should fail if the json in the recipe body fails to parse (in practise, this just means don’t catch the json exception)
// should fail if there is no id field in the recipe json

function extractRecipeData(article:Content, block: Block):recipeDataOutput[] {
  const allRecipes = block.elements
    .filter(elem => elem.type==ElementType.RECIPE)
    .map(recp => parseJsonBlob(article, recp.recipeTypeData.recipeJson))

  return allRecipes
}

function parseJsonBlob(article:Content, recipeJson:string):recipeDataOutput {
  const recipeData = JSON.parse(recipeJson)
  return {
    UId:`${article.webUrl}-${recipeData.id}`,
    jsonData: recipeData.jsonBlob,
    checksum: recipeData.checksum
  }
}
