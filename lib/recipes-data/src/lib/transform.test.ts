import type { Contributor } from './models';
import type { RecipeFixture } from './recipe-fixtures';
import { recipes } from './recipe-fixtures';
import {
	handleFreeTextContribs,
	replaceImageUrlsWithFastly,
} from './transform';

jest.mock('./config', () => ({
	FeaturedImageWidth: 700,
	PreviewImageWidth: 300,
	ImageDpr: 1,
}));

describe('Recipe transforms', () => {
	describe('handleFreeTextContribs', () => {
		it('should put contributor tags into the contributors array and freetext tags into the byline array', () => {
			const incoming = {
				contributors: [
					{ type: 'contributor', tagId: 'profile/andy-gallagher' },
					{ type: 'freetext', text: 'Barry the Fish With Fingers' },
				] as Contributor[],
			};

			const result = handleFreeTextContribs(incoming);
			expect(result.contributors).toEqual(['profile/andy-gallagher']);
			expect(result.byline).toEqual(['Barry the Fish With Fingers']);
		});

		it('should place legacy string-only IDs into the contributors array', () => {
			const incoming = {
				contributors: [
					'profile/andy-gallagher',
					{ type: 'contributor', tagId: 'profile/kenneth-anger' },
				] as Array<Contributor | string>,
			};
			const result = handleFreeTextContribs(incoming);
			expect(result.contributors).toEqual([
				'profile/andy-gallagher',
				'profile/kenneth-anger',
			]);
			expect(result.byline).toEqual([]);
		});

		it('should return empty arrays if there is nothing in the inital array', () => {
			const incoming = { contributors: [] };

			const result = handleFreeTextContribs(incoming);
			expect(result.contributors).toEqual([]);
			expect(result.byline).toEqual([]);
		});
	});

	describe('replaceImageUrlsWithFastly', () => {
		const assertImageUrls = (
			originalRecipe: RecipeFixture,
			newRecipe: RecipeFixture,
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

		it('should replace a preview image with a fastly URL, if the relevant fields are present - 1', () => {
			const transformedRecipeReference = replaceImageUrlsWithFastly(recipes[0]);

			assertImageUrls(
				recipes[0],
				transformedRecipeReference,
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_2412_5626_3375/master/2000.jpg?width=700&dpr=1&s=none',
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_257_5626_6188/master/2000.jpg?width=300&dpr=1&s=none',
			);
		});

		it('should replace a preview image with a fastly URL, if the relevant fields are present - 2', () => {
			const transformedRecipeReference = replaceImageUrlsWithFastly(recipes[1]);

			assertImageUrls(
				recipes[1],
				transformedRecipeReference,
				'https://i.guim.co.uk/img/media/902a2c387ba62c49ad7553c2712eb650e73eb5b2/258_0_7328_4400/master/2000.jpg?width=700&dpr=1&s=none',
				'https://i.guim.co.uk/img/media/902a2c387ba62c49ad7553c2712eb650e73eb5b2/258_0_7328_4400/master/2000.jpg?width=300&dpr=1&s=none',
			);
		});

		it('should assume a default width if the originalWidth field is not present on the image', () => {
			const { width: _, ...featuredImage } = recipes[0].featuredImage;
			const recipeWithFeaturedImageWithoutCropId = {
				...recipes[0],
				featuredImage,
			};

			const transformedRecipeReference = replaceImageUrlsWithFastly(
				recipeWithFeaturedImageWithoutCropId,
			);

			assertImageUrls(
				recipes[0],
				transformedRecipeReference,
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_2412_5626_3375/master/2000.jpg?width=700&dpr=1&s=none',
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_257_5626_6188/master/2000.jpg?width=300&dpr=1&s=none',
			);
		});

		it("should backfill the preview image if there isn't one", () => {
			const { previewImage: _, ...recipeWithoutPreview } = recipes[0];

			const transformedRecipeReference =
				replaceImageUrlsWithFastly(recipeWithoutPreview);

			assertImageUrls(
				recipeWithoutPreview,
				transformedRecipeReference,
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_2412_5626_3375/master/2000.jpg?width=700&dpr=1&s=none',
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_2412_5626_3375/master/2000.jpg?width=300&dpr=1&s=none',
			);
		});

		it('should attempt to extract cropId from original URL if the featured image is missing a cropId', () => {
			const { cropId: _, ...featuredImage } = recipes[0].featuredImage;
			const recipeWithFeaturedImageWithoutCropId = {
				...recipes[0],
				featuredImage,
			};

			const transformedRecipeReference = replaceImageUrlsWithFastly(
				recipeWithFeaturedImageWithoutCropId,
			);

			assertImageUrls(
				recipeWithFeaturedImageWithoutCropId,
				transformedRecipeReference,
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/360_1725_4754_4754/master/2000.jpg?width=700&dpr=1&s=none',
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_257_5626_6188/master/2000.jpg?width=300&dpr=1&s=none',
			);
		});

		it('should attempt to extract a crop from the original URL if the preview image is missing a cropId', () => {
			const { cropId: _, ...previewImage } = recipes[0].previewImage!;
			const recipeWithPreviewImageWithoutCropId = {
				...recipes[0],
				previewImage,
			};

			const transformedRecipeReference = replaceImageUrlsWithFastly(
				recipeWithPreviewImageWithoutCropId,
			);

			assertImageUrls(
				recipeWithPreviewImageWithoutCropId,
				transformedRecipeReference,
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_2412_5626_3375/master/2000.jpg?width=700&dpr=1&s=none',
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/360_1725_4754_4754/master/2000.jpg?width=300&dpr=1&s=none',
			);
		});

		it('should not attempt to extract a crop from the original URL if the featured image URL is not a guim URL', () => {
			const { cropId: _, ...previewImage } = recipes[0].previewImage!;
			const recipeWithPreviewImageWithoutCropId = {
				...recipes[0],
				previewImage: {
					...previewImage,
					url: 'https://cdn.road.cc/sites/default/files/styles/main_width/public/Wat-duck.png',
				},
			};

			const transformedRecipeReference = replaceImageUrlsWithFastly(
				recipeWithPreviewImageWithoutCropId,
			);

			assertImageUrls(
				recipeWithPreviewImageWithoutCropId,
				transformedRecipeReference,
				'https://i.guim.co.uk/img/media/87a7591d5260e962ad459d56771f50fc0ce05f14/0_2412_5626_3375/master/2000.jpg?width=700&dpr=1&s=none',
				'https://cdn.road.cc/sites/default/files/styles/main_width/public/Wat-duck.png',
			);
		});
	});
});
