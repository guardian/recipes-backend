import type { Content } from '@guardian/content-api-models/v1/content';
import { ContentType } from '@guardian/content-api-models/v1/contentType';
import type {
	CAPIRecipeReference,
	RecipeIndexEntry,
} from '@recipes-api/lib/recipes-data';
import {
	announceNewRecipe,
	calculateChecksum,
	convertToRecipeV2,
	extractAllRecipesFromArticle,
	insertNewRecipe,
	publishRecipeContent,
	recipesToTakeDown,
	removeRecipeVersion,
	sendTelemetryEvent,
} from '@recipes-api/lib/recipes-data';
import { handleContentUpdate } from './update_processor';
import Mock = jest.Mock;

const staticBucketName = 'static-bucket';
const fastlyApiKey = 'fastly-api-key';
const contentPrefix = 'cdn.content.location';
const outgoingEventBus = 'outgoing-event-bus';

jest.mock('@recipes-api/lib/recipes-data', () => ({
	calculateChecksum: jest.fn(),
	convertToRecipeV2: jest.fn(),
	extractAllRecipesFromArticle: jest.fn(),
	insertNewRecipe: jest.fn(),
	publishRecipeContent: jest.fn(),
	recipesToTakeDown: jest.fn(),
	removeRecipeVersion: jest.fn(),
	sendTelemetryEvent: jest.fn(),
	announceNewRecipe: jest.fn(),
}));

const fakeContent: Content = {
	apiUrl: 'api://path/to/content',
	id: 'path/to/content',
	isHosted: false,
	references: [],
	tags: [],
	type: ContentType.ARTICLE,
	webTitle: 'Test Article',
	webUrl: 'web://path/to/content',
};

describe('update_processor.handleContentUpdate', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.spyOn(global, 'fetch').mockImplementation(jest.fn());
	});

	it('should extract recipes from the content, publish those and take-down any that were no longer needed', async () => {
		const refsInArticle: CAPIRecipeReference[] = [
			{ recipeUID: 'uid-recep-1', jsonBlob: '', sponsorshipCount: 0 },
			{ recipeUID: 'uid-recep-2', jsonBlob: '', sponsorshipCount: 0 },
			{ recipeUID: 'uid-recep-3', jsonBlob: '', sponsorshipCount: 0 },
		];

		const refsToRemove: RecipeIndexEntry[] = [
			{
				recipeUID: 'uid-recep-2',
				checksum: 'xxxyyyzzz',
				capiArticleId: 'path/to/article',
				sponsorshipCount: 0,
			},
			{
				recipeUID: 'uid-recep-4',
				checksum: 'zzzyyyqqq',
				capiArticleId: 'path/to/article',
				sponsorshipCount: 0,
			},
		];

		// @ts-ignore -- Typescript doesn't know that this is a mock
		extractAllRecipesFromArticle.mockReturnValue(
			Promise.resolve(refsInArticle),
		);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		recipesToTakeDown.mockReturnValue(refsToRemove);

		calculateChecksum
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce('abcd1')
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce('abcd1')
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce('efgh')
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce('efgh')
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce('xyzp')
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce('xyzp');

		// @ts-ignore -- Typescript doesn't know that this is a mock
		convertToRecipeV2.mockReturnValue('');

		await handleContentUpdate({
			content: fakeContent,
			staticBucketName,
			fastlyApiKey,
			contentPrefix,
			outgoingEventBus,
			shouldPublishV2: true,
		});

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(extractAllRecipesFromArticle.mock.calls.length).toEqual(1);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(calculateChecksum.mock.calls.length).toEqual(6);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(insertNewRecipe.mock.calls.length).toEqual(3);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(insertNewRecipe.mock.calls[0][0]).toEqual(
			expect.objectContaining({
				recipeVersion: 'abcd1',
				recipeUID: 'uid-recep-1',
				capiArticleId: 'path/to/content',
				sponsorshipCount: 0,
				versions: {
					v2: 'abcd1',
					v3: 'abcd1',
				},
			}),
		);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(insertNewRecipe.mock.calls[1][0]).toEqual(
			expect.objectContaining({
				recipeVersion: 'efgh',
				recipeUID: 'uid-recep-2',
				capiArticleId: 'path/to/content',
				sponsorshipCount: 0,
				versions: {
					v2: 'efgh',
					v3: 'efgh',
				},
			}),
		);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(insertNewRecipe.mock.calls[2][0]).toEqual(
			expect.objectContaining({
				recipeVersion: 'xyzp',
				recipeUID: 'uid-recep-3',
				capiArticleId: 'path/to/content',
				sponsorshipCount: 0,
				versions: {
					v2: 'xyzp',
					v3: 'xyzp',
				},
			}),
		);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(publishRecipeContent.mock.calls.length).toEqual(3);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(publishRecipeContent.mock.calls[0][0].recipe).toEqual({
			recipeUID: 'uid-recep-1',
			recipeV3Blob: { jsonBlob: '', checksum: 'abcd1' },
			recipeV2Blob: { jsonBlob: '', checksum: 'abcd1' },
			sponsorshipCount: 0,
		});
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(publishRecipeContent.mock.calls[1][0].recipe).toEqual({
			recipeUID: 'uid-recep-2',
			recipeV3Blob: { jsonBlob: '', checksum: 'efgh' },
			recipeV2Blob: { jsonBlob: '', checksum: 'efgh' },
			sponsorshipCount: 0,
		});
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(publishRecipeContent.mock.calls[2][0].recipe).toEqual({
			recipeUID: 'uid-recep-3',
			recipeV3Blob: { jsonBlob: '', checksum: 'xyzp' },
			recipeV2Blob: { jsonBlob: '', checksum: 'xyzp' },
			sponsorshipCount: 0,
		});

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(removeRecipeVersion.mock.calls.length).toEqual(2);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(removeRecipeVersion.mock.calls[0][0].canonicalArticleId).toEqual(
			'path/to/content',
		);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(removeRecipeVersion.mock.calls[0][0].recipe).toEqual({
			checksum: 'xxxyyyzzz',
			recipeUID: 'uid-recep-2',
			capiArticleId: 'path/to/article',
			sponsorshipCount: 0,
		});
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(removeRecipeVersion.mock.calls[1][0].canonicalArticleId).toEqual(
			'path/to/content',
		);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(removeRecipeVersion.mock.calls[1][0].recipe).toEqual({
			checksum: 'zzzyyyqqq',
			recipeUID: 'uid-recep-4',
			capiArticleId: 'path/to/article',
			sponsorshipCount: 0,
		});

		expect((sendTelemetryEvent as Mock).mock.calls.length).toEqual(3);
		expect((sendTelemetryEvent as Mock).mock.calls[0][0]).toEqual(
			'PublishedData',
		);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(announceNewRecipe.mock.calls.length).toEqual(1);
	});

	it('should ignore a piece of content that is not an article', async () => {
		const refsInArticle: CAPIRecipeReference[] = [
			{ recipeUID: 'uid-recep-1', jsonBlob: '', sponsorshipCount: 0 },
			{ recipeUID: 'uid-recep-2', jsonBlob: '', sponsorshipCount: 0 },
			{ recipeUID: 'uid-recep-3', jsonBlob: '', sponsorshipCount: 0 },
		];

		const refsToRemove: RecipeIndexEntry[] = [
			{
				recipeUID: 'uid-recep-2',
				checksum: 'xxxyyyzzz',
				capiArticleId: 'path/to/article',
				sponsorshipCount: 0,
			},
			{
				recipeUID: 'uid-recep-4',
				checksum: 'zzzyyyqqq',
				capiArticleId: 'path/to/article',
				sponsorshipCount: 0,
			},
		];

		// @ts-ignore -- Typescript doesn't know that this is a mock
		extractAllRecipesFromArticle.mockReturnValue(
			Promise.resolve(refsInArticle),
		);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		recipesToTakeDown.mockReturnValue(refsToRemove);

		calculateChecksum
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce({
				recipeUID: 'uid-recep-1',
				jsonBlob: '',
				checksum: 'abcd1',
				sponsorshipCount: 0,
			})
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce({
				recipeUID: 'uid-recep-2',
				jsonBlob: '',
				checksum: 'efgh',
				sponsorshipCount: 0,
			})
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce({
				recipeUID: 'uid-recep-3',
				jsonBlob: '',
				checksum: 'xyzp',
				sponsorshipCount: 0,
			});

		await handleContentUpdate({
			content: { ...fakeContent, type: ContentType.GALLERY },
			staticBucketName,
			fastlyApiKey,
			contentPrefix,
			outgoingEventBus,
			shouldPublishV2: true,
		});

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(extractAllRecipesFromArticle.mock.calls.length).toEqual(0);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(calculateChecksum.mock.calls.length).toEqual(0);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(insertNewRecipe.mock.calls.length).toEqual(0);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(publishRecipeContent.mock.calls.length).toEqual(0);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(removeRecipeVersion.mock.calls.length).toEqual(0);

		expect((sendTelemetryEvent as Mock).mock.calls.length).toEqual(0);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(announceNewRecipe.mock.calls.length).toEqual(0);
	});

	it('should be fine if there is no recipe content', async () => {
		const refsInArticle: CAPIRecipeReference[] = [];

		const refsToRemove: RecipeIndexEntry[] = [];

		// @ts-ignore -- Typescript doesn't know that this is a mock
		extractAllRecipesFromArticle.mockReturnValue(
			Promise.resolve(refsInArticle),
		);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		recipesToTakeDown.mockReturnValue(refsToRemove);

		await handleContentUpdate({
			content: fakeContent,
			staticBucketName,
			fastlyApiKey,
			contentPrefix,
			outgoingEventBus,
			shouldPublishV2: true,
		});

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(extractAllRecipesFromArticle.mock.calls.length).toEqual(1);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(calculateChecksum.mock.calls.length).toEqual(0);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(insertNewRecipe.mock.calls.length).toEqual(0);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(publishRecipeContent.mock.calls.length).toEqual(0);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(removeRecipeVersion.mock.calls.length).toEqual(0);

		expect((sendTelemetryEvent as Mock).mock.calls.length).toEqual(0);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(announceNewRecipe.mock.calls.length).toEqual(0);
	});

	it('should publish as normal if the telemetry fails', async () => {
		const refsInArticle: CAPIRecipeReference[] = [
			{ recipeUID: 'uid-recep-1', jsonBlob: '', sponsorshipCount: 0 },
			{ recipeUID: 'uid-recep-2', jsonBlob: '', sponsorshipCount: 0 },
			{ recipeUID: 'uid-recep-3', jsonBlob: '', sponsorshipCount: 0 },
		];

		const refsToRemove: RecipeIndexEntry[] = [
			{
				recipeUID: 'uid-recep-2',
				checksum: 'xxxyyyzzz',
				capiArticleId: 'path/to/article',
				sponsorshipCount: 0,
			},
			{
				recipeUID: 'uid-recep-4',
				checksum: 'zzzyyyqqq',
				capiArticleId: 'path/to/article',
				sponsorshipCount: 0,
			},
		];

		// @ts-ignore -- Typescript doesn't know that this is a mock
		extractAllRecipesFromArticle.mockReturnValue(
			Promise.resolve(refsInArticle),
		);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		recipesToTakeDown.mockReturnValue(refsToRemove);

		(sendTelemetryEvent as Mock).mockRejectedValue(
			new Error('something went splat'),
		);

		calculateChecksum
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce('abcd1')
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce('abcd1')
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce('efgh')
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce('efgh')
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce('xyzp')
			// @ts-ignore -- Typescript doesn't know that this is a mock
			.mockReturnValueOnce('xyzp');
		// @ts-ignore -- Typescript doesn't know that this is a mock
		convertToRecipeV2.mockReturnValue('');

		await handleContentUpdate({
			content: fakeContent,
			staticBucketName,
			fastlyApiKey,
			contentPrefix,
			outgoingEventBus,
			shouldPublishV2: true,
		});

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(extractAllRecipesFromArticle.mock.calls.length).toEqual(1);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(calculateChecksum.mock.calls.length).toEqual(6);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(insertNewRecipe.mock.calls.length).toEqual(3);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(insertNewRecipe.mock.calls[0][0]).toEqual(
			expect.objectContaining({
				recipeVersion: 'abcd1',
				recipeUID: 'uid-recep-1',
				capiArticleId: 'path/to/content',
				sponsorshipCount: 0,
				versions: {
					v2: 'abcd1',
					v3: 'abcd1',
				},
			}),
		);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(insertNewRecipe.mock.calls[1][0]).toEqual(
			expect.objectContaining({
				recipeVersion: 'efgh',
				recipeUID: 'uid-recep-2',
				capiArticleId: 'path/to/content',
				sponsorshipCount: 0,
				versions: {
					v2: 'efgh',
					v3: 'efgh',
				},
			}),
		);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(insertNewRecipe.mock.calls[2][0]).toEqual(
			expect.objectContaining({
				recipeVersion: 'xyzp',
				recipeUID: 'uid-recep-3',
				capiArticleId: 'path/to/content',
				sponsorshipCount: 0,
				versions: {
					v2: 'xyzp',
					v3: 'xyzp',
				},
			}),
		);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(publishRecipeContent.mock.calls.length).toEqual(3);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(publishRecipeContent.mock.calls[0][0].recipe).toEqual({
			recipeUID: 'uid-recep-1',
			recipeV3Blob: { jsonBlob: '', checksum: 'abcd1' },
			recipeV2Blob: { jsonBlob: '', checksum: 'abcd1' },
			sponsorshipCount: 0,
		});
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(publishRecipeContent.mock.calls[1][0].recipe).toEqual({
			recipeUID: 'uid-recep-2',
			recipeV3Blob: { jsonBlob: '', checksum: 'efgh' },
			recipeV2Blob: { jsonBlob: '', checksum: 'efgh' },
			sponsorshipCount: 0,
		});
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(publishRecipeContent.mock.calls[2][0].recipe).toEqual({
			recipeUID: 'uid-recep-3',
			recipeV3Blob: { jsonBlob: '', checksum: 'xyzp' },
			recipeV2Blob: { jsonBlob: '', checksum: 'xyzp' },
			sponsorshipCount: 0,
		});

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(removeRecipeVersion.mock.calls.length).toEqual(2);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(removeRecipeVersion.mock.calls[0][0].canonicalArticleId).toEqual(
			'path/to/content',
		);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(removeRecipeVersion.mock.calls[0][0].recipe).toEqual({
			checksum: 'xxxyyyzzz',
			recipeUID: 'uid-recep-2',
			capiArticleId: 'path/to/article',
			sponsorshipCount: 0,
		});
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(removeRecipeVersion.mock.calls[1][0].canonicalArticleId).toEqual(
			'path/to/content',
		);
		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(removeRecipeVersion.mock.calls[1][0].recipe).toEqual({
			checksum: 'zzzyyyqqq',
			recipeUID: 'uid-recep-4',
			capiArticleId: 'path/to/article',
			sponsorshipCount: 0,
		});

		expect((sendTelemetryEvent as Mock).mock.calls.length).toEqual(3);
		expect((sendTelemetryEvent as Mock).mock.calls[0][0]).toEqual(
			'PublishedData',
		);

		// @ts-ignore -- Typescript doesn't know that this is a mock
		expect(announceNewRecipe.mock.calls.length).toEqual(1);
	});
});
