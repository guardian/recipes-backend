import type {Block} from "@guardian/content-api-models/v1/block";
import type {Blocks} from "@guardian/content-api-models/v1/blocks";
import type {Content} from "@guardian/content-api-models/v1/content";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import {ElementType} from "@guardian/content-api-models/v1/elementType";
import type {RecipeReferenceWithoutChecksum} from './models';

export function extractAllRecipesFromArticle(content: Content): RecipeReferenceWithoutChecksum[] {
  let allRecipesInAnArticle = Array<RecipeReferenceWithoutChecksum>()

  if (content.type == ContentType.ARTICLE && content.blocks) {
    const articleBlocks: Blocks = content.blocks
    const getAllMainBlockRecipesIfPresent: RecipeReferenceWithoutChecksum[] = extractRecipeData(content.id, articleBlocks.main as Block)
    const bodyBlocks = articleBlocks.body as Block[]
    const getAllBodyBlocksRecipesIfPresent: RecipeReferenceWithoutChecksum[] = bodyBlocks.flatMap(bodyBlock => extractRecipeData(content.id, bodyBlock))
    allRecipesInAnArticle = getAllMainBlockRecipesIfPresent.concat(...getAllBodyBlocksRecipesIfPresent)
  }
  return allRecipesInAnArticle
}

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
