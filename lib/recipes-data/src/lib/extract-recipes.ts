import type {Block} from "@guardian/content-api-models/v1/block";
import type {Blocks} from "@guardian/content-api-models/v1/blocks";
import type {Content} from "@guardian/content-api-models/v1/content";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import {ElementType} from "@guardian/content-api-models/v1/elementType";
import type {RecipeReferenceWithoutChecksum} from './models';

export function extractAllRecipesFromArticle(content: Content): RecipeReferenceWithoutChecksum[] {
  if (content.type == ContentType.ARTICLE && content.blocks) {
    const articleBlocks: Blocks = content.blocks
    const getAllMainBlockRecipesIfPresent: RecipeReferenceWithoutChecksum[] = extractRecipeData(content.id, articleBlocks.main as Block)
    const bodyBlocks = articleBlocks.body as Block[]
    const getAllBodyBlocksRecipesIfPresent: RecipeReferenceWithoutChecksum[] = bodyBlocks.flatMap(bodyBlock => extractRecipeData(content.id, bodyBlock))
    return getAllMainBlockRecipesIfPresent.concat(getAllBodyBlocksRecipesIfPresent)
  } else {
    return Array<RecipeReferenceWithoutChecksum>()
  }
}

export function extractRecipeData(canonicalId: string, block: Block): RecipeReferenceWithoutChecksum[] {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- real life disagrees with the typings here. No elements => block.elements undefined.
  if(!block.elements) return [];

  return block.elements
    .filter(elem => elem.type === ElementType.RECIPE)
    .map(recp => parseJsonBlob(canonicalId, recp.recipeTypeData?.recipeJson as string))
    .filter(recp => !!recp) as RecipeReferenceWithoutChecksum[]
}

function parseJsonBlob(canonicalId: string, recipeJson: string): RecipeReferenceWithoutChecksum | null {
  const recipeData = JSON.parse(recipeJson) as Record<string, unknown>
  if (!recipeData.id) {
    return null //TODO: we should incorporate a metric for failed recipes so we can have an indication of upstream issues.
  } else {
    return <RecipeReferenceWithoutChecksum>{
      recipeUID: `${recipeData.id as string}`,
      jsonBlob: recipeJson
    }
  }
}
