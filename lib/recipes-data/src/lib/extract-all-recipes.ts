import type {Blocks} from "@guardian/content-api-models/v1/blocks";
import type {Content} from "@guardian/content-api-models/v1/content";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import {extractRecipeData} from "./extract_recipedata_from_element";

export interface AllRecipesInAnArticle { //TODO confirm all these values to go in from article and recipe
  immutableID: string;
  mutableID: string;
  canonicalID: string;
}

export function extractAllRecipesFromArticle(content: Content): AllRecipesInAnArticle[] {
  let allRecipesInAnArticle = Array<AllRecipesInAnArticle>()

  if (content.type == ContentType.ARTICLE) {
    const articleBlocks: Blocks = content.blocks
    const getAllMainBlockRecipesIfPresent = extractRecipeData(content.id, articleBlocks.main)
    const getAllBodyBlocksRecipesIfPresent = articleBlocks.body?.flatMap(bodyBlock => extractRecipeData(content.id, bodyBlock))
    const recipesFound = getAllMainBlockRecipesIfPresent.concat(getAllBodyBlocksRecipesIfPresent)

    allRecipesInAnArticle = recipesFound.map(recp => {
      return <AllRecipesInAnArticle>{ //TODO to confirm as mentioned above as well
        immutableID: recp.recipeUID,
        mutableID: "",
        canonicalId: content.id
      }
    })
  }

  return allRecipesInAnArticle
}
