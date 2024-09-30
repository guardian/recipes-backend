import {createHash} from "crypto";
import type {Block} from "@guardian/content-api-models/v1/block";
import type {Blocks} from "@guardian/content-api-models/v1/blocks";
import type {Content} from "@guardian/content-api-models/v1/content";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import {ElementType} from "@guardian/content-api-models/v1/elementType";
import type {Sponsorship} from "@guardian/content-api-models/v1/sponsorship";
import {registerMetric} from "@recipes-api/cwmetrics";
import type {Contributor, RecipeDates, RecipeReferenceWithoutChecksum} from './models';
import {
  addRecipeDatesTransform,
  addSponsorsTransform,
  handleFreeTextContribs,
  replaceCanonicalArticle,
  replaceImageUrlsWithFastly
} from "./transform";
import type {
  RecipeTransformationFunction,
  RecipeWithImageData
} from "./transform";
import { capiDateTimeToDate } from "./utils";

export async function extractAllRecipesFromArticle(content: Content): Promise<RecipeReferenceWithoutChecksum[]> {
  if (content.type == ContentType.ARTICLE && content.blocks) {
    const sponsorship = content.tags.flatMap(t => t.activeSponsorships ?? [])
    const articleBlocks: Blocks = content.blocks
    const getAllMainBlockRecipesIfPresent = extractRecipeData(content, articleBlocks.main as Block, sponsorship)
    const bodyBlocks = articleBlocks.body as Block[]
    const getAllBodyBlocksRecipesIfPresent = bodyBlocks.flatMap(bodyBlock => extractRecipeData(content, bodyBlock, sponsorship))
    const recipes = getAllMainBlockRecipesIfPresent.concat(getAllBodyBlocksRecipesIfPresent)
    const failureCount = recipes.filter(recp => !recp).length
    await registerMetric("FailedRecipes", failureCount)
    const successfulCount = recipes.length - failureCount
    await registerMetric("SuccessfulRecipes", successfulCount)
    return recipes.filter(recp => !!recp) as RecipeReferenceWithoutChecksum[]
  } else {
    return Array<RecipeReferenceWithoutChecksum>()
  }
}


export function extractRecipeData(content: Content, block: Block, sponsorship: Sponsorship[]): Array<RecipeReferenceWithoutChecksum | null> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- to fix error when elements are undefined , example if main block does not have any elements.
  if (!block?.elements) return [];
  else {
    const recipeDates: RecipeDates = {
      lastModifiedDate: capiDateTimeToDate(block.lastModifiedDate),
      firstPublishedDate: getFirstPublishedDate(block, content),
      publishedDate: getPublishedDate(block, content)
    }
    return block.elements
  .filter(elem => elem.type === ElementType.RECIPE)
  .map(recp => parseJsonBlob(content.id, recp.recipeTypeData?.recipeJson as string, sponsorship, recipeDates))
  }
}

export function getFirstPublishedDate(block: Block, content: Content): Date | undefined {
	return block.firstPublishedDate ? capiDateTimeToDate(block.firstPublishedDate) : (content.fields?.firstPublicationDate ? capiDateTimeToDate(content.fields.firstPublicationDate) : undefined);
}

export function getPublishedDate(block: Block, content: Content): Date | undefined {
  const feastChannel = content.channels?.find(channel => channel.channelId === 'feast');
  return block.publishedDate ? capiDateTimeToDate(block.publishedDate) :
    (feastChannel?.fields.publicationDate ? capiDateTimeToDate(feastChannel.fields.publicationDate) : undefined);
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

function parseJsonBlob(canonicalId: string, recipeJson: string, sponsorship: Sponsorship[], recipeDates: RecipeDates): RecipeReferenceWithoutChecksum | null {
  try {
    const recipeData = JSON.parse(recipeJson) as (Record<string, unknown> & {
      contributors: Array<string | Contributor>;
    } & RecipeWithImageData);

    const transforms: RecipeTransformationFunction[] = [
      handleFreeTextContribs,
      replaceImageUrlsWithFastly,
      addSponsorsTransform(sponsorship),
      addRecipeDatesTransform(recipeDates),
      replaceCanonicalArticle(canonicalId)
    ];

    const updatedRecipe = transforms.reduce((acc, transform) => transform(acc), recipeData);

    const rerendedJson = JSON.stringify(updatedRecipe);

    if (!recipeData.id) {
      console.error(`Recipe from ${canonicalId} has no ID field. Content was: ${recipeJson}`);
      return null
    } else {
      return <RecipeReferenceWithoutChecksum>{
        recipeUID: determineRecipeUID(recipeData.id, canonicalId),
        jsonBlob: rerendedJson,
        sponsorshipCount: sponsorship.length
      }
    }

  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions -- err.toString() is untyped but OK
    console.error(`Recipe from ${canonicalId} was not parsable: ${err.toString()}`);
    console.error(`Content was ${recipeJson}`);
    return null;
  }
}
