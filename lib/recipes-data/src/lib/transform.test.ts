import { exampleRecipe } from './recipe-fixtures';
import type { RecipeWithImageData } from './transform';
import { createFastlyImageTransformer } from './transform';

describe('Recipe transforms', () => {
	describe('createFastlyImageTransformer', () => {
		const assertImageUrls = (
			originalRecipe: RecipeWithImageData,
			newRecipe: RecipeWithImageData,
			expectedFeaturedUrl: string,
			expectedPreviewUrl: string,
		) => {
			const {
				featuredImage: originalFeaturedImage,
				previewImage: originalPreviewImage,
			} = originalRecipe;

			const { featuredImage, previewImage, ..._ } = newRecipe;

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
			const transformedRecipeReference = createFastlyImageTransformer(
				700,
				300,
				1,
			)(exampleRecipe);

			assertImageUrls(
				exampleRecipe,
				transformedRecipeReference,
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_2412_5626_3375/master/2000.jpg?width=700&dpr=1&s=none',
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_257_5626_6188/master/2000.jpg?width=300&dpr=1&s=none',
			);
		});

		it("should backfill the preview image if there isn't one", () => {
			const { previewImage: _, ...recipeWithoutPreview } = exampleRecipe;

			const transformedRecipeReference = createFastlyImageTransformer(
				700,
				300,
				1,
			)(recipeWithoutPreview);

			assertImageUrls(
				recipeWithoutPreview,
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

			const transformedRecipeReference = createFastlyImageTransformer(
				700,
				300,
				1,
			)(recipeWithFeaturedImageWithoutCropId);

			assertImageUrls(
				recipeWithFeaturedImageWithoutCropId,
				transformedRecipeReference,
				'https://media.guim.co.uk/87a7591d5260e962ad459d56771f50fc0ce05f14/360_1725_4754_4754/2000.jpg',
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_257_5626_6188/master/2000.jpg?width=300&dpr=1&s=none',
			);
		});

		it('should ignore if the preview image is missing a cropId', () => {
			const { cropId: _, ...previewImage } = exampleRecipe.previewImage;
			const recipeWithPreviewImageWithoutCropId = {
				...exampleRecipe,
				previewImage,
			};

			const transformedRecipeReference = createFastlyImageTransformer(
				700,
				300,
				1,
			)(recipeWithPreviewImageWithoutCropId);

			assertImageUrls(
				recipeWithPreviewImageWithoutCropId,
				transformedRecipeReference,
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_2412_5626_3375/master/2000.jpg?width=700&dpr=1&s=none',
				'https://media.guim.co.uk/87a7591d5260e962ad459d56771f50fc0ce05f14/360_1725_4754_4754/2000.jpg',
			);
		});
	});
});
