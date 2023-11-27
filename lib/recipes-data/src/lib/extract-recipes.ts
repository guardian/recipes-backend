import type {Block} from "@guardian/content-api-models/v1/block";
import type {Blocks} from "@guardian/content-api-models/v1/blocks";
import type {Content} from "@guardian/content-api-models/v1/content";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import {ElementType} from "@guardian/content-api-models/v1/elementType";
import {registerMetric} from "@recipes-api/cwmetrics";
import type {RecipeReferenceWithoutChecksum} from './models';

export async function extractAllRecipesFromArticle(content: Content): Promise<RecipeReferenceWithoutChecksum[]> {
  if (content.type == ContentType.ARTICLE && content.blocks) {
    const articleBlocks: Blocks = content.blocks
    const getAllMainBlockRecipesIfPresent = extractRecipeData(content.id, articleBlocks.main as Block)
    const bodyBlocks = articleBlocks.body as Block[]
    const getAllBodyBlocksRecipesIfPresent = bodyBlocks.flatMap(bodyBlock => extractRecipeData(content.id, bodyBlock))
    const recipes = getAllMainBlockRecipesIfPresent.concat(getAllBodyBlocksRecipesIfPresent)
    const failureCount = recipes.filter(recp => !recp).length
    await registerMetric("FailedRecipe", failureCount)
    return recipes.filter(recp => !!recp) as RecipeReferenceWithoutChecksum[]
  } else {
    return Array<RecipeReferenceWithoutChecksum>()
  }
}

export function extractRecipeData(canonicalId: string, block: Block): Array<RecipeReferenceWithoutChecksum | null> {
  return block.elements
    .filter(elem => elem.type === ElementType.RECIPE)
    .map(recp => parseJsonBlob(canonicalId, recp.recipeTypeData?.recipeJson as string))
}

function parseJsonBlob(canonicalId: string, recipeJson: string): RecipeReferenceWithoutChecksum | null {
  const recipeData = JSON.parse(recipeJson) as Record<string, unknown>
  if (!recipeData.id) {
    return null
  } else {
    return <RecipeReferenceWithoutChecksum>{
      recipeUID: `${recipeData.id as string}`,
      jsonBlob: recipeJson
    }
  }
}
