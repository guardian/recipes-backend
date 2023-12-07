import {createHash} from "crypto";
import type {Block} from "@guardian/content-api-models/v1/block";
import type {Blocks} from "@guardian/content-api-models/v1/blocks";
import type {Content} from "@guardian/content-api-models/v1/content";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import {ElementType} from "@guardian/content-api-models/v1/elementType";
import {registerMetric} from "@recipes-api/cwmetrics";
import type {RecipeReferenceWithoutChecksum} from './models';
import {updateRecipeFields} from "./recipe_fields_updater";

export async function extractAllRecipesFromArticle(content: Content): Promise<RecipeReferenceWithoutChecksum[]> {
  if (content.type == ContentType.ARTICLE && content.blocks) {
    const articleBlocks: Blocks = content.blocks
    const getAllMainBlockRecipesIfPresent = extractRecipeData(content.id, articleBlocks.main as Block)
    const bodyBlocks = articleBlocks.body as Block[]
    const getAllBodyBlocksRecipesIfPresent = bodyBlocks.flatMap(bodyBlock => extractRecipeData(content.id, bodyBlock))
    const recipes = getAllMainBlockRecipesIfPresent.concat(getAllBodyBlocksRecipesIfPresent)
    const failureCount = recipes.filter(recp => !recp).length
    await registerMetric("FailedRecipes", failureCount)
    await registerMetric("SuccessfulRecipes", recipes.length)

    const validRecipes = recipes.filter(recp => !!recp) as RecipeReferenceWithoutChecksum[]
    return validRecipes.map(recep=>updateRecipeFields(content, recep));
  } else {
    return Array<RecipeReferenceWithoutChecksum>()
  }
}


export function extractRecipeData(canonicalId: string, block: Block): Array<RecipeReferenceWithoutChecksum | null> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- to fix error when elements are undefined , example if main block does not have any elements.
  if (!block?.elements) return [];
  else {
    return block.elements
      .filter(elem => elem.type === ElementType.RECIPE)
      .map(recp => parseJsonBlob(canonicalId, recp.recipeTypeData?.recipeJson as string))
  }
}

/**
 * Most recipes have a UUID-style `id` field, so we pass that through.
 * However some of the ones that were extracted by D&I have a numeric field still.
 * In that case, we concatenate the canonical ID onto the numeric value and then sha1 the lot.
 * @param recipeIdField incoming ID of the recipe
 * @param canonicalId canonical ID of the article
 * @returns a useful unique ID for the recipe
 */
function determineRecipeUID(recipeIdField: string, canonicalId: string): string {
  if (recipeIdField.match(/^\d+$/)) {
    const hasher = createHash("sha1");
    //do the same as https://github.com/guardian/flexible-content/blob/6e963d9027d02a4f3af4637dbe6498934d904a4f/flexible-content-integration/src/main/scala/com/gu/flexiblecontent/integration/dispatcher/RecipesImportDispatcher.scala#L213
    const stringToHash = `${recipeIdField}-${canonicalId}`;
    return hasher.update(stringToHash).digest("hex");
  } else {
    return recipeIdField;
  }
}

function parseJsonBlob(canonicalId: string, recipeJson: string): RecipeReferenceWithoutChecksum | null {
  try {
    const recipeData = JSON.parse(recipeJson) as Record<string, unknown>
    if (!recipeData.id) {
      console.error(`Recipe from ${canonicalId} has no ID field. Content was: ${recipeJson}`);
      return null
    } else {
      return <RecipeReferenceWithoutChecksum>{
        recipeUID: determineRecipeUID(recipeData.id as string, canonicalId),
        jsonData: recipeData,
      }
    }

  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions -- err.toString() is untyped but OK
    console.error(`Recipe from ${canonicalId} was not parsable: ${err.toString()}`);
    console.error(`Content was ${recipeJson}`);
    return null;
  }
}
