import type {Blocks} from "@guardian/content-api-models/v1/blocks";
import type {Content} from "@guardian/content-api-models/v1/content";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import {extractRecipeData} from "./extract_recipedata_from_element";


interface AllRecipesInAnArticle {
  immutableID: string;
  mutableID: string;
  canonicalID: string;
}

export function extractAllRecipesFromArticle(content: Content): void { //TODO replace return type void with AllRecipesInAnArticle[]
  if (content.type == ContentType.ARTICLE) {
    const articleBlocks: Blocks = content.blocks
    const getAllMainBlockRecipesIfPresent = extractRecipeData(content.id, articleBlocks.main)
    const getAllBodyBlocksRecipesIfPresent = articleBlocks.body?.map(bodyBlock => extractRecipeData(content.id, bodyBlock))
    const allRecipeFound = [...getAllMainBlockRecipesIfPresent, ...getAllBodyBlocksRecipesIfPresent]
  }

}
