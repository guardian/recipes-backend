import type { Sponsorship } from '@guardian/content-api-models/v1/sponsorship';
import { extractRecipeData } from './extract-recipes';
import { activeSponsorships, block, canonicalId, invalidRecipeElements, multipleRecipeElements, noRecipeElements, recipeDates, singleRecipeElement } from './recipe-fixtures';
import type { RecipeWithImageData } from './transform';
import { capiDateTimeToDate } from './utils';

jest.mock('./config', () => ({
	FeaturedImageWidth: 700,
	PreviewImageWidth: 300,
	ImageDpr: 1,
}));

describe('extractRecipeData', () => {
	it('should work when block containing single recipe element', () => {
		const testBlock = { ...block, elements: singleRecipeElement };
		const result = extractRecipeData(canonicalId, testBlock, []);
		expect(result.length).toEqual(1);
		expect(result[0]?.recipeUID).toEqual(
			'62ac3f0f98f6495cbefd72c11fac6d1e26390e99',
		);
		const originalContent = testBlock.elements[1].recipeTypeData?.recipeJson
			? (JSON.parse(testBlock.elements[1].recipeTypeData.recipeJson) as Record<
					string,
					unknown
			  >)
			: {};
		const expected = JSON.stringify({
			...originalContent,
			contributors: ['profile/thomasina-miers'],
			byline: [],
		});
		expect(result[0]?.jsonBlob).toEqual(expected);
	});

	it('should work when block containing multiple recipe elements', () => {
		const testBlock = { ...block, elements: multipleRecipeElements}
		const result = extractRecipeData(canonicalId, testBlock, []);
		expect(result.length).toEqual(3);
		expect(result[2]?.recipeUID).toEqual(
			'62ac3f0f98f6495cbefd72c11fac6d1e26390e99',
		);
		const originalContent = testBlock.elements[3].recipeTypeData?.recipeJson
			? (JSON.parse(testBlock.elements[3].recipeTypeData.recipeJson) as Record<
					string,
					unknown
			  >)
			: {};
		const expected = JSON.stringify({
			...originalContent,
			contributors: ['profile/thomasina-miers'],
			byline: [],
		});
		expect(result[2]?.jsonBlob).toEqual(expected);
	});

	it('should work when block containing no recipe elements ', () => {
		const testBlock = { ...block, elements: noRecipeElements}
		const result = extractRecipeData(canonicalId, testBlock, []);
		expect(result.length).toEqual(0);
	});

	it('should return empty array when block has got invalid recipe element (no ID field) ', () => {
		const testBlock = { ...block, elements: invalidRecipeElements}
		const recipesFound = extractRecipeData(canonicalId, testBlock, []);
		expect(recipesFound).toEqual([null]);
		expect(recipesFound.length).toEqual(1);
	});

	it('should work when block containing recipe element and is sponsored, means we have sponsorship data as well', () => {
		const testBlock = { ...block, elements: singleRecipeElement };
		const result = extractRecipeData(canonicalId, testBlock, activeSponsorships);
		expect(result.length).toEqual(1);
		expect(result[0]?.recipeUID).toEqual(
			'62ac3f0f98f6495cbefd72c11fac6d1e26390e99',
		);
		const data = JSON.parse(result[0]?.jsonBlob as string) as JSON;
		const sponsorsExists = 'sponsors' in data;
		expect(sponsorsExists).toBe(true);
		expect(data).toHaveProperty('sponsors[0].sponsorshipType', 'Sponsored');
		expect(data).toHaveProperty(
			'sponsors[0].sponsorLink',
			'https://theguardian.org/',
		);
		expect(data).not.toHaveProperty('sponsors[0].targeting');
		expect(result[0]?.sponsorshipCount).toEqual(1);
	});

	it('should work when block containing recipe element but not sponsored, means no sponsor data available', () => {
		const testBlock = { ...block, elements: singleRecipeElement };
		const activeSponsorships: Sponsorship[] = [];
		const result = extractRecipeData(canonicalId, testBlock, activeSponsorships);
		expect(result.length).toEqual(1);
		expect(result[0]?.recipeUID).toEqual(
			'62ac3f0f98f6495cbefd72c11fac6d1e26390e99',
		);
		const data = JSON.parse(result[0]?.jsonBlob as string) as JSON;
		const sponsorsExists = 'sponsors' in data;
		expect(sponsorsExists).toBe(false);
		expect(data).not.toHaveProperty('sponsors[0].sponsorshipType');
		expect(data).not.toHaveProperty('sponsors[0].sponsorLink');
		expect(result[0]?.sponsorshipCount).toEqual(0);
	});

	it('should update the canonicalArticle with the content ID', () => {
		const canonicalId = 'a-new-path';
    const testBlock = { ...block, elements: singleRecipeElement };
		const result = extractRecipeData(canonicalId, testBlock, []);
		expect(result.length).toEqual(1);
		const data = JSON.parse(
			result[0]?.jsonBlob as string,
		) as RecipeWithImageData;
		expect(data.canonicalArticle).toBe(canonicalId);
	});

	it('should add recipe dates where specified', () => {
		const testBlock = { ...block, elements: singleRecipeElement, ...recipeDates };
		const result = extractRecipeData(canonicalId, testBlock, []);
		expect(result.length).toEqual(1);
		expect(result[0]?.recipeUID).toEqual(
			'62ac3f0f98f6495cbefd72c11fac6d1e26390e99',
		);
		const originalContent = testBlock.elements[1].recipeTypeData?.recipeJson
			? (JSON.parse(testBlock.elements[1].recipeTypeData.recipeJson) as Record<
					string,
					unknown
			  >)
			: {};
		const expected = JSON.stringify({
			...originalContent,
			contributors: ['profile/thomasina-miers'],
			byline: [],
			lastModifiedDate: capiDateTimeToDate(recipeDates.lastModifiedDate),
      firstPublishedDate: capiDateTimeToDate(recipeDates.firstPublishedDate),
      publishedDate: capiDateTimeToDate(recipeDates.publishedDate),
		});
		expect(result[0]?.jsonBlob).toEqual(expected);
	});

	it('should not add recipe dates where undefined', () => {
		const recipeDates = {
			lastModifiedDate: undefined,
			firstPublishedDate: undefined,
			publishedDate: undefined,
		};
		const testBlock = { ...block, elements: singleRecipeElement, ...recipeDates };
		const result = extractRecipeData(canonicalId, testBlock, []);
		expect(result.length).toEqual(1);
		expect(result[0]?.recipeUID).toEqual(
			'62ac3f0f98f6495cbefd72c11fac6d1e26390e99',
		);
		const originalContent = testBlock.elements[1].recipeTypeData?.recipeJson
			? (JSON.parse(testBlock.elements[1].recipeTypeData.recipeJson) as Record<
					string,
					unknown
			  >)
			: {};
		const expected = JSON.stringify({
			...originalContent,
			contributors: ['profile/thomasina-miers'],
			byline: [],
		});
		expect(result[0]?.jsonBlob).toEqual(expected);
	});
});
