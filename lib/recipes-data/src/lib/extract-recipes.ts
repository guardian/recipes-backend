import {createHash} from "crypto";
import type {Block} from "@guardian/content-api-models/v1/block";
import type {Blocks} from "@guardian/content-api-models/v1/blocks";
import type {Content} from "@guardian/content-api-models/v1/content";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import {ElementType} from "@guardian/content-api-models/v1/elementType";
import type {RecipeReferenceWithoutChecksum} from './models';

export function extractAllRecipesFromArticle(content: Content): RecipeReferenceWithoutChecksum[] {
  if (content.type == ContentType.ARTICLE && content.blocks) {
    const articleBlocks: Blocks = content.blocks
    const getAllMainBlockRecipesIfPresent: RecipeReferenceWithoutChecksum[] = extractRecipeData(content.id, articleBlocks.main)
    const bodyBlocks = articleBlocks.body
    const getAllBodyBlocksRecipesIfPresent: RecipeReferenceWithoutChecksum[] = bodyBlocks? bodyBlocks.flatMap(bodyBlock => extractRecipeData(content.id, bodyBlock)) : [];
    return getAllMainBlockRecipesIfPresent.concat(getAllBodyBlocksRecipesIfPresent)
  } else {
    return Array<RecipeReferenceWithoutChecksum>()
  }
}

export function extractRecipeData(canonicalId: string, block?: Block): RecipeReferenceWithoutChecksum[] {
  if(! block?.elements) return [];

  return block.elements
    .filter(elem => elem.type === ElementType.RECIPE)
    .map(recp => parseJsonBlob(canonicalId, recp.recipeTypeData?.recipeJson as string))
    .filter(recp => !!recp) as RecipeReferenceWithoutChecksum[]
}

/**
 * Most recipes have a UUID-style `id` field, so we pass that through.
 * However some of the ones that were extracted by D&I have a numeric field still.
 * In that case, we concatenate the canonical ID onto the numeric value and then sha1 the lot.
 * @param contentIdField
 * @param canonicalId
 */
function determineRecipeUID(contentIdField:string, canonicalId: string): string
{
  if(contentIdField.match(/^\d+$/)) {
    const hasher = createHash("sha1");
    //do the same as https://github.com/guardian/flexible-content/blob/6e963d9027d02a4f3af4637dbe6498934d904a4f/flexible-content-integration/src/main/scala/com/gu/flexiblecontent/integration/dispatcher/RecipesImportDispatcher.scala#L213
    const stringToHash = `${contentIdField}-${canonicalId}`;
    return hasher.update(stringToHash).digest("hex");
  } else {
    return contentIdField;
  }
}

function parseJsonBlob(canonicalId: string, recipeJson: string): RecipeReferenceWithoutChecksum | null {
  try {
    const recipeData = JSON.parse(recipeJson) as Record<string, unknown>
    if (!recipeData.id) {
      console.error(`Recipe from ${canonicalId} has no ID field. Content was:`);
      console.error(recipeJson);
      return null //TODO: we should incorporate a metric for failed recipes so we can have an indication of upstream issues.
    } else {
      return <RecipeReferenceWithoutChecksum>{
        recipeUID: determineRecipeUID(recipeData.id as string, canonicalId),
        jsonBlob: recipeJson
      }
    }
  } catch(err) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions -- err.toString() is untyped but OK
    console.error(`Recipe from ${canonicalId} was not parsable: ${err.toString()}`);
    console.error(`Content was ${recipeJson}`);
    return null;
  }
}
