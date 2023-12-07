import type {Content} from "@guardian/content-api-models/v1/content";
import type { RecipeReferenceWithoutChecksum } from './models';

type ParsedRecipe = Record<string, unknown>;
type FieldsUpdaterFunction = (article:Content, recipe:ParsedRecipe) => ParsedRecipe;
const isEmptyRegex = /^\s*$/;  //"empty" can mean zero-length or consisting entirely of whitespace

/**
 * Internal function that is called from updateRecipeFields; only exported for tests. Don't use directly.
 */
const updateByline:FieldsUpdaterFunction = (article, recipe)=> {
  const existingByline = recipe["byline"] as (string[]|string|undefined);

  if(!existingByline    //is it null?
    || (Array.isArray(existingByline) && existingByline.filter(str=>!str.match(isEmptyRegex)).length==0)  //or an array consisting of zero or only empty strings?
    || (typeof existingByline==="string" && existingByline.match(isEmptyRegex))  //or an empty string?
  ) {
    return {
      ...recipe,
      byline: article.fields?.byline ?? ""
    }
  } else {
    return recipe
  }
}

function grokBylineHtml(bylineHtml:string):string[]
{
  const searcher = /href="([\w/-]+)"/g;
  const matches = Array.from(bylineHtml.matchAll(searcher));
  const profileTags = matches.map(arr=>{
    try {
      return arr[1]
    } catch(err) {
      return null
    }
  }).filter(t=>!!t);
  return profileTags as string[];
}

/**
 * Internal function that is called from updateRecipeFields; only exported for tests. Don't use directly.
 */
export const updateContributors:FieldsUpdaterFunction = (article, recipe) => {
  const existingContribs = recipe["contributors"] as string[]|undefined;

  if(!existingContribs || existingContribs.filter(str=>!str.match(isEmptyRegex)).length==0) {
    //the contributors list is either not defined or empty or contains only whitespace strings
    return {
      ...recipe,
      contributors: article.fields?.bylineHtml ? grokBylineHtml(article.fields.bylineHtml) : [],
    }
  } else {
    return recipe
  }
}

/**
 * There are some fields which are optional in Composer and whose values should be filled in from the article meta-data
 * during publication.
 * Call this function to check the fields and populate them if necessary
 * @param article entire article Content containing the meta-data
 * @param recipe recipe to inject the data into
 */
export function updateRecipeFields(article:Content, recipe: RecipeReferenceWithoutChecksum):RecipeReferenceWithoutChecksum {
  const updaterChain:FieldsUpdaterFunction[] = [
    updateByline,
    updateContributors
  ];

  const updated = updaterChain.reduce((currentRecipe, updater)=>updater(article, currentRecipe), recipe.jsonData);

  return {
    ...recipe,
    jsonData: updated,
  }
}
