import type { RecipeReference } from './models';
import { exampleRecipe } from './recipe-fixtures';
import { replaceImageUrlWithFastlyResizer } from './transform';
import type { Recipe } from './types';

describe('recipe transforms', () => {
	describe('replacePreviewImageUrlWithFastlyResizer', () => {
		const toRecipeReference = (recipe: Recipe): RecipeReference => ({
			checksum: 'nnubtrrtXLtDf-BO5Yf0dWZukjyplE0TXhLAMxR797E',
			recipeUID: 'e92079895225469b8f09efcc0fe8f455',
			jsonBlob: JSON.stringify(recipe),
		});

		const assertImageUrls = (
			originalReference: RecipeReference,
			newReference: RecipeReference,
			expectedFeaturedUrl: string,
			expectedPreviewUrl: string,
		) => {
			const {
				featuredImage: originalFeaturedImage,
				previewImage: originalPreviewImage,
			} = JSON.parse(originalReference.jsonBlob) as Recipe;

			const { featuredImage, previewImage, ..._ } = JSON.parse(
				newReference.jsonBlob,
			) as Recipe;

			// We should have transformed the relevant URLs
			expect(featuredImage.url).toBe(expectedFeaturedUrl);
			expect(previewImage?.url).toBe(expectedPreviewUrl);

			const { url: __, ...remainingFeaturedImage } = featuredImage;
			const { url: ___, ...remainingPreviewImage } = previewImage ?? {};

			// Everything else should be the same
			expect(originalFeaturedImage).toMatchObject(remainingFeaturedImage);

			if (originalPreviewImage) {
				expect(originalPreviewImage).toMatchObject(remainingPreviewImage);
			}
		};

		it('should replace a preview image with a fastly URL, if the relevant fields are present', () => {
			const exampleRecipeReference = toRecipeReference(exampleRecipe);

			const transformedRecipeReference = replaceImageUrlWithFastlyResizer(
				exampleRecipeReference,
				700,
				300,
				1,
			);

			assertImageUrls(
				exampleRecipeReference,
				transformedRecipeReference,
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_2412_5626_3375/master/2000.jpg?width=700&dpr=1&s=none',
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_257_5626_6188/master/2000.jpg?width=300&dpr=1&s=none',
			);
		});

		it("should backfill the preview image if there isn't one", () => {
			const { previewImage: _, ...recipeWithoutPreview } = exampleRecipe;

			const exampleRecipeReferenceWithoutPreview =
				toRecipeReference(recipeWithoutPreview);

			const transformedRecipeReference = replaceImageUrlWithFastlyResizer(
				exampleRecipeReferenceWithoutPreview,
				700,
				300,
				1,
			);

			assertImageUrls(
				exampleRecipeReferenceWithoutPreview,
				transformedRecipeReference,
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_2412_5626_3375/master/2000.jpg?width=700&dpr=1&s=none',
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_2412_5626_3375/master/2000.jpg?width=300&dpr=1&s=none',
			);
		});

		it('should ignore if the featured image is missing a cropId', () => {
			const { cropId: _, ...featuredImage } = exampleRecipe.featuredImage;
			const recipeWithFeaturedImageWithoutCropId = {
				...exampleRecipe,
				featuredImage,
			};

			const exampleRecipeWithFeaturedImageWithoutCropId = toRecipeReference(
				recipeWithFeaturedImageWithoutCropId,
			);

			const transformedRecipeReference = replaceImageUrlWithFastlyResizer(
				exampleRecipeWithFeaturedImageWithoutCropId,
				700,
				300,
				1,
			);

			assertImageUrls(
				exampleRecipeWithFeaturedImageWithoutCropId,
				transformedRecipeReference,
				'https://media.guim.co.uk/87a7591d5260e962ad459d56771f50fc0ce05f14/360_1725_4754_4754/2000.jpg',
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_257_5626_6188/master/2000.jpg?width=300&dpr=1&s=none',
			);
		});

		it('should ignore if the preview image is missing a cropId', () => {
			const { cropId: _, ...previewImage } = exampleRecipe.previewImage!;
			const recipeWithPreviewImageWithoutCropId = {
				...exampleRecipe,
				previewImage,
			};

			const exampleRecipeWithPreviewImageWithoutCropId = toRecipeReference(
				recipeWithPreviewImageWithoutCropId,
			);
			const transformedRecipeReference = replaceImageUrlWithFastlyResizer(
				exampleRecipeWithPreviewImageWithoutCropId,
				700,
				300,
				1,
			);

			assertImageUrls(
				exampleRecipeWithPreviewImageWithoutCropId,
				transformedRecipeReference,
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_2412_5626_3375/master/2000.jpg?width=700&dpr=1&s=none',
				'https://media.guim.co.uk/87a7591d5260e962ad459d56771f50fc0ce05f14/360_1725_4754_4754/2000.jpg',
			);
		});

		it('should ignore if the recipe JSON is invalid', () => {
			const invalidRecipe = {
				checksum: 'nnubtrrtXLtDf-BO5Yf0dWZukjyplE0TXhLAMxR797E',
				recipeUID: 'e92079895225469b8f09efcc0fe8f455',
				jsonBlob: 'oh-no-:(',
			};

			const transformedRecipeReference = replaceImageUrlWithFastlyResizer(
				invalidRecipe,
				700,
				300,
				1,
			);

			expect(invalidRecipe).toEqual(transformedRecipeReference);
		});
	});
});
