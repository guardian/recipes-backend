import { FeaturedImageWidth, ImageDpr, PreviewImageWidth } from './config';
import type { Contributor, RecipeImage } from './models';
import { extractCropIdFromGuimUrl } from './utils';

const getFastlyUrl = (
	imageId: string,
	cropId: string,
	dpr: number,
	desiredWidth: number,
	originalWidth?: number,
) => {
	// This works because if we cannot find the correct image, Fastly Resizer fails over to the closest width.
  // Assumption is that 2000 is a safe width to start with and Fastly will work downwards to a width it can find.
	// See https://github.com/guardian/fastly-image-service/blob/34399e065bc85b8ca4d5adeeca02b4b6404eaa98/fastly-io_guim_co_uk/src/main/resources/varnish/main.vcl#L122
	const width = originalWidth ?? '2000';
	return `https://i.guim.co.uk/img/media/${imageId}/${cropId}/master/${width}.jpg?width=${desiredWidth}&dpr=${dpr}&s=none`;
};

export const replaceFastlyUrl = (
	recipeId: string,
	image: RecipeImage,
	desiredWidth: number,
	dpr: number,
): RecipeImage => {
	const { width, mediaId } = image;

	if (!mediaId) {
		console.warn(
			`Error adding fastly URL to recipe ${recipeId} - no mediaId found for image ${JSON.stringify(image)}`,
		);
		return image;
	}

	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- we're testing for an empty string
	const cropId = image.cropId || extractCropIdFromGuimUrl(image.url);

	if (!cropId) {
		console.warn(
			`Error adding fastly URL to recipe ${recipeId} - no cropId found for image with id ${image.mediaId}.`,
		);
		return image;
	}

	return {
		...image,
		url: getFastlyUrl(mediaId, cropId, dpr, desiredWidth, width),
	};
};

export type RecipeWithImageData = {
	id: string;
	featuredImage: RecipeImage | string; // the latter is an old image format that appears in our test fixtures
	previewImage?: RecipeImage | string;
};

/**
 * Replace the featured and preview image URLs, which are by convention full-resolution crops,
 * with Fastly resizer urls. Allows us to serve lower resolution assets to the app.
 */
export const replaceImageUrlsWithFastly = <R extends RecipeWithImageData>(
	recipe: R,
): R => {
	if (
		typeof recipe.featuredImage === 'string' ||
		typeof recipe.previewImage === 'string'
	) {
		return recipe;
	}

	try {
		return {
			...recipe,
			previewImage: replaceFastlyUrl(
				recipe.id,
				recipe.previewImage ?? recipe.featuredImage,
				PreviewImageWidth,
				ImageDpr,
			),
			featuredImage: replaceFastlyUrl(
				recipe.id,
				recipe.featuredImage,
				FeaturedImageWidth,
				ImageDpr,
			),
		};
	} catch (err) {
		if (err instanceof Error) {
			console.warn(
				`Could not replace preview image url with fastly resizer url for recipe ${recipe.id} - ${err.message}`,
				err,
			);
		}
		return recipe;
	}
};

/**
 * Composer will pass an ADT, in the format {type: "contributor", tagId: string} | {type: "freetext", text: string}.  We need to put the 'contributor' tags into
 * the "contributors" array and the "freetext" tags into the "byline" array.  We must also handle the migration case, where we still get a raw string passed over.
 * @param parsedRecipe raw parsed recipe
 */
export function handleFreeTextContribs<
	R extends { contributors: Array<string | Contributor> },
>(parsedRecipe: R): R & { contributors: string[]; byline: string[] } {
	const contributorTags: string[] = [];
	const freetexts: string[] = [];

	parsedRecipe.contributors.forEach((entry) => {
		if (typeof entry === 'string') {
			//it's an old one, a contrib tag
			contributorTags.push(entry);
		} else {
			//it's a Contributor object
			switch (entry.type) {
				case 'contributor':
					contributorTags.push(entry.tagId);
					break;
				case 'freetext':
					freetexts.push(entry.text);
					break;
			}
		}
	});

	return { ...parsedRecipe, contributors: contributorTags, byline: freetexts };
}
