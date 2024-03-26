import type { RecipeReference } from './models';
import type { Recipe, RecipeImage } from './types';

const getFastlyUrl = (
	imageId: string,
	cropId: string,
	originalWidth: number,
	desiredWidth: number,
	dpr: number,
) =>
	`https://i.guim.co.uk/img/media/${imageId}/${cropId}/master/${originalWidth}.jpg?width=${desiredWidth}&dpr=${dpr}&s=none`;

export const replaceFastlyUrl = (
	recipeId: string,
	image: RecipeImage,
	desiredWidth: number,
	dpr: number,
): RecipeImage => {
	const { width, mediaId, cropId } = image;

	if (!cropId) {
		console.warn(`No cropId found for image with id ${image.mediaId}.`);
		return image;
	}

	return {
		...image,
		url: getFastlyUrl(mediaId, cropId, width, desiredWidth, dpr),
	};
};

export const replaceImageUrlWithFastlyResizer = (
	recipe: RecipeReference,
	featuredImageWidth: number,
	previewImageWidth: number,
	dpr: number,
): RecipeReference => {
	try {
		const recipeContent = JSON.parse(recipe.jsonBlob) as Recipe;

		return {
			...recipe,
			jsonBlob: JSON.stringify({
				...recipeContent,
				previewImage: replaceFastlyUrl(
					recipeContent.id,
					recipeContent.previewImage ?? recipeContent.featuredImage,
					previewImageWidth,
					dpr,
				),
				featuredImage: replaceFastlyUrl(
					recipeContent.id,
					recipeContent.featuredImage,
					featuredImageWidth,
					dpr,
				),
			}),
		};
	} catch (err) {
		if (err instanceof Error) {
			console.warn(
				`Could not replace preview image url with fastly resizer url for recipe ${recipe.recipeUID} with checksum ${recipe.checksum} - ${err.message}`,
				err,
			);
		}
		return recipe;
	}
};
