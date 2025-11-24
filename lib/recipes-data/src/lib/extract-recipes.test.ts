import type { Sponsorship } from '@guardian/content-api-models/v1/sponsorship';
import {
	extractRecipeData,
	getFirstPublishedDate,
	getPublishedDate,
} from './extract-recipes';
import {
	activeSponsorships,
	activeSponsorshipsIGA,
	block,
	content,
	feastChannel,
	feastChannelNoDate,
	fields,
	invalidRecipeElements,
	multipleRecipeElements,
	nonFeastChannel,
	noRecipeElements,
	recipeDates,
	singleRecipeElement,
} from './recipe-fixtures';
import type { RecipeWithImageData } from './transform';
import { addSponsorsTransform } from './transform';
import { capiDateTimeToDate } from './utils';

jest.mock('./config', () => ({
	FeaturedImageWidth: 700,
	PreviewImageWidth: 300,
	ImageDpr: 1,
}));

describe('extractRecipeData', () => {
	it('should work when block containing single recipe element', () => {
		const testBlock = { ...block, elements: singleRecipeElement };
		const result = extractRecipeData(content, testBlock, []);
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
		const testBlock = { ...block, elements: multipleRecipeElements };
		const result = extractRecipeData(content, testBlock, []);
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
		const testBlock = { ...block, elements: noRecipeElements };
		const result = extractRecipeData(content, testBlock, []);
		expect(result.length).toEqual(0);
	});

	it('should return empty array when block has got invalid recipe element (no ID field) ', () => {
		const testBlock = { ...block, elements: invalidRecipeElements };
		const recipesFound = extractRecipeData(content, testBlock, []);
		expect(recipesFound).toEqual([null]);
		expect(recipesFound.length).toEqual(1);
	});

	it('should work when block containing recipe element and is sponsored, means we have sponsorship data as well', () => {
		const testBlock = { ...block, elements: singleRecipeElement };
		const result = extractRecipeData(content, testBlock, activeSponsorships);
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
		const result = extractRecipeData(content, testBlock, activeSponsorships);
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
		const testContent = { ...content, id: canonicalId };
		const testBlock = { ...block, elements: singleRecipeElement };
		const result = extractRecipeData(testContent, testBlock, []);
		expect(result.length).toEqual(1);
		const data = JSON.parse(
			result[0]?.jsonBlob as string,
		) as RecipeWithImageData;
		expect(data.canonicalArticle).toBe(canonicalId);
	});

	it('should add recipe dates where specified', () => {
		const testBlock = {
			...block,
			elements: singleRecipeElement,
			...recipeDates,
		};
		const result = extractRecipeData(content, testBlock, []);
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
		const testBlock = {
			...block,
			elements: singleRecipeElement,
			...recipeDates,
		};
		const result = extractRecipeData(content, testBlock, []);
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

describe('getFirstPublishedDate', () => {
	it('should return value of firstPublishedDate from the block if it exists', () => {
		const testBlock = {
			...block,
			elements: singleRecipeElement,
			...recipeDates,
		};
		const testContent = { ...content, ...fields };
		const firstPublishedDate = getFirstPublishedDate(testBlock, testContent);
		expect(firstPublishedDate).toEqual(
			new Date(recipeDates.firstPublishedDate.iso8601),
		);
	});

	it('should return value of firstPublishedDate from content.fields if it exists and not defined in the block', () => {
		const testBlock = { ...block, elements: singleRecipeElement };
		const testContent = { ...content, ...fields };
		const firstPublishedDate = getFirstPublishedDate(testBlock, testContent);
		expect(firstPublishedDate).toEqual(
			capiDateTimeToDate(fields.fields.firstPublicationDate),
		);
	});

	it('should return undefined if firstPublishedDate does not exist in either the block or content.fields', () => {
		const testBlock = { ...block, elements: singleRecipeElement };
		const testFields = {};
		const testContent = { ...content, ...testFields };
		const firstPublishedDate = getFirstPublishedDate(testBlock, testContent);
		expect(firstPublishedDate).toEqual(undefined);
	});
});

describe('getPublishedDate', () => {
	it('should return publishedDate from the block if it exists', () => {
		const testBlock = {
			...block,
			elements: singleRecipeElement,
			...recipeDates,
		};
		const testContent = { ...content, ...fields };
		const publishedDate = getPublishedDate(testBlock, testContent);
		expect(publishedDate).toEqual(new Date(recipeDates.publishedDate.iso8601));
	});

	it('should return publicationDate from the Feast channel if it exists and not defined in the block', () => {
		const testBlock = { ...block, elements: singleRecipeElement };
		const testChannels = { channels: [...nonFeastChannel, ...feastChannel] };
		const testContent = { ...content, ...testChannels };
		const publishedDate = getPublishedDate(testBlock, testContent);
		expect(publishedDate).toEqual(new Date('2024-09-17T11:00:28Z'));
	});

	it('should return undefined if not defined in the block and no Feast channel exists', () => {
		const testBlock = { ...block, elements: singleRecipeElement };
		const testChannels = { channels: [...nonFeastChannel] };
		const testContent = { ...content, ...testChannels };
		const publishedDate = getPublishedDate(testBlock, testContent);
		expect(publishedDate).toEqual(undefined);
	});

	it('should return undefined if not defined in the block, and a Feast channel exists but no publicationDate is defined', () => {
		const testBlock = { ...block, elements: singleRecipeElement };
		const testChannels = {
			channels: [...nonFeastChannel, ...feastChannelNoDate],
		};
		const testContent = { ...content, ...testChannels };
		const publishedDate = getPublishedDate(testBlock, testContent);
		expect(publishedDate).toEqual(undefined);
	});

	describe('Sponsorship handling for IGA', () => {
		it('should not apply addSponsorsTransform if IGA sponsorship exists', () => {
			const sponsorship = activeSponsorshipsIGA;
			const recipe = { id: 'test-recipe' };
			const transform = sponsorship.some((s) =>
				s.sponsorName.toLowerCase().includes('iga'),
			)
				? // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- we know it's not any
					(recipe) => recipe
				: addSponsorsTransform(sponsorship);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- we know it's not
			const result = transform(recipe);

			expect(result).toEqual(recipe); // Recipe should remain unchanged
		});

		it('should apply addSponsorsTransform if IGA sponsorship does not exist', () => {
			const sponsorship = activeSponsorships;
			const recipe = { id: 'test-recipe' };
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- we know it's not any
			const mockAddSponsorsTransform = jest.fn((recipe) => ({
				...recipe,
				sponsors: sponsorship,
			}));

			const transform = sponsorship.some((s) =>
				s.sponsorName.toLowerCase().includes('iga'),
			)
				? // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- we know it's not any
					(recipe) => recipe
				: mockAddSponsorsTransform;

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- we know it's not
			const result = transform(recipe);

			expect(mockAddSponsorsTransform).toHaveBeenCalledWith(recipe);
			expect(result).toEqual({
				id: 'test-recipe',
				sponsors: sponsorship,
			});
		});
	});
});
