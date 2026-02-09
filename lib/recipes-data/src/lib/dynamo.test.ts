import {
	BatchWriteItemCommand,
	DeleteItemCommand,
	DynamoDBClient,
	QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import {
	bulkRemoveRecipe,
	multipleRecipesByUid,
	recipeByUID,
	removeAllRecipeIndexEntriesForArticle,
	removeRecipe,
} from './dynamo';
import type { RecipeDatabaseEntry, RecipeDatabaseKey } from './models';
import {
	recipeDatabaseEntryToDynamo,
	recipeDatabaseEntryToIndexEntries,
} from './models';

jest.mock('./config', () => ({
	indexTableName: 'TestTable',
}));

const mockDynamoClient = mockClient(DynamoDBClient);

function makeRecptBatch(length: number): RecipeDatabaseKey[] {
	const results: RecipeDatabaseKey[] = [];

	for (let i = 0; i < length; i++) {
		results.push({
			capiArticleId: `path/to/article${i}`,
			recipeUID: `uid-${i}`,
		});
	}
	return results;
}

describe('dynamodb', () => {
	beforeEach(() => {
		mockDynamoClient.reset();
		jest.resetAllMocks();
		jest.spyOn(global, 'fetch').mockImplementation(jest.fn());
	});

	describe('dynamodb.removeRecipe', () => {
		it('should make a Dynamo request to remove the relevant record', async () => {
			mockDynamoClient.on(DeleteItemCommand).resolves({});

			await removeRecipe('path/to/some/article-id', 'xxxyyyzzz');
			expect(mockDynamoClient.commandCalls(DeleteItemCommand).length).toEqual(
				1,
			);
			const call = mockDynamoClient.commandCalls(DeleteItemCommand)[0];
			const req = call.firstArg as DeleteItemCommand;
			expect(req.input.Key).toEqual({
				capiArticleId: { S: 'path/to/some/article-id' },
				recipeUID: { S: 'xxxyyyzzz' },
			});
			expect(req.input.TableName).toEqual('TestTable');
		});
	});

	describe('dynamodb.bulkRemoveRecipe', () => {
		it('should handle a small (<25) batch of articles', async () => {
			mockDynamoClient.on(BatchWriteItemCommand).resolves({
				UnprocessedItems: { TestTable: [] },
			});

			await bulkRemoveRecipe(makeRecptBatch(6));
			expect(
				mockDynamoClient.commandCalls(BatchWriteItemCommand).length,
			).toEqual(1);
			const call = mockDynamoClient.commandCalls(BatchWriteItemCommand)[0];
			const req = call.firstArg as BatchWriteItemCommand;
			const items = req.input.RequestItems?.TestTable ?? [];
			expect(items.length).toEqual(6);
			for (let i = 0; i < 6; i++) {
				expect(items[i].DeleteRequest).toEqual({
					Key: {
						capiArticleId: { S: `path/to/article${i}` },
						recipeUID: { S: `uid-${i}` },
					},
				});
			}
		});

		it('should paginate a large (>25) batch of articles', async () => {
			mockDynamoClient.on(BatchWriteItemCommand).resolves({
				UnprocessedItems: { TestTable: [] },
			});

			await bulkRemoveRecipe(makeRecptBatch(93));
			expect(
				mockDynamoClient.commandCalls(BatchWriteItemCommand).length,
			).toEqual(4);

			//for brevity, we're just checking the last page of calls
			const call = mockDynamoClient.commandCalls(BatchWriteItemCommand)[3];
			const req = call.firstArg as BatchWriteItemCommand;
			const items = req.input.RequestItems?.TestTable ?? [];
			expect(items.length).toEqual(18);
			for (let i = 75; i < 93; i++) {
				expect(items[i - 75].DeleteRequest).toEqual({
					Key: {
						capiArticleId: { S: `path/to/article${i}` },
						recipeUID: { S: `uid-${i}` },
					},
				});
			}
		});

		it('should loop to ensure that unprocessed items get retried', async () => {
			const items = makeRecptBatch(8);
			mockDynamoClient
				.on(BatchWriteItemCommand)
				.resolvesOnce({
					UnprocessedItems: {
						TestTable: [
							{
								DeleteRequest: {
									Key: {
										capiArticleId: { S: items[3].capiArticleId },
										recipeUID: { S: items[3].recipeUID },
									},
								},
							},
							{
								DeleteRequest: {
									Key: {
										capiArticleId: { S: items[5].capiArticleId },
										recipeUID: { S: items[5].recipeUID },
									},
								},
							},
						],
					},
				})
				.resolves({});

			await bulkRemoveRecipe(items);

			//We expect two write calls, one with all 8 of the items and the second with the two that were skipped
			expect(
				mockDynamoClient.commandCalls(BatchWriteItemCommand).length,
			).toEqual(2);

			const firstCall = mockDynamoClient.commandCalls(BatchWriteItemCommand)[0];
			const firstReq = firstCall.firstArg as BatchWriteItemCommand;
			const firstItems = firstReq.input.RequestItems?.TestTable ?? [];
			expect(firstItems.length).toEqual(8);
			for (let i = 0; i < 8; i++) {
				expect(firstItems[i].DeleteRequest).toEqual({
					Key: {
						capiArticleId: { S: items[i].capiArticleId },
						recipeUID: { S: items[i].recipeUID },
					},
				});
			}

			const secondCall = mockDynamoClient.commandCalls(
				BatchWriteItemCommand,
			)[1];
			const secondReq = secondCall.firstArg as BatchWriteItemCommand;
			const secondItems = secondReq.input.RequestItems?.TestTable ?? [];
			expect(secondItems.length).toEqual(2);
			expect(secondItems[0].DeleteRequest).toEqual({
				Key: {
					capiArticleId: { S: items[3].capiArticleId },
					recipeUID: { S: items[3].recipeUID },
				},
			});
			expect(secondItems[1].DeleteRequest).toEqual({
				Key: {
					capiArticleId: { S: items[5].capiArticleId },
					recipeUID: { S: items[5].recipeUID },
				},
			});
		});
	});

	describe('dynamodb.removeAllRecipeIndexEntriesForArticle', () => {
		it('should query the table to find items relating to the given article, then remove all of them and return the old references', async () => {
			const fakeRecords: RecipeDatabaseEntry[] = [
				{
					capiArticleId: 'path/to/article',
					recipeUID: 'recep1',
					recipeVersion: 'xxxyyyzzz',
					versions: {
						v2: 'xxxyyyzzz',
						v3: null,
					},
					sponsorshipCount: 0,
					lastUpdated: new Date(),
				},
				{
					capiArticleId: 'path/to/article',
					recipeUID: 'recep2',
					recipeVersion: 'xxxyyyzzz',
					versions: {
						v2: 'xxxyyyzzz',
						v3: null,
					},
					sponsorshipCount: 0,
					lastUpdated: new Date(),
				},
				{
					capiArticleId: 'path/to/article',
					recipeUID: 'recep3',
					recipeVersion: 'xxxyyyzzz',
					versions: {
						v2: 'xxxyyyzzz',
						v3: null,
					},
					sponsorshipCount: 0,
					lastUpdated: new Date(),
				},
				{
					capiArticleId: 'path/to/article',
					recipeUID: 'recep4',
					recipeVersion: 'xxxyyyzzz',
					versions: {
						v2: 'xxxyyyzzz',
						v3: null,
					},
					sponsorshipCount: 0,
					lastUpdated: new Date(),
				},
			];
			mockDynamoClient.on(QueryCommand).resolves({
				Items: fakeRecords.map(recipeDatabaseEntryToDynamo),
			});
			mockDynamoClient.on(BatchWriteItemCommand).resolves({});

			const result =
				await removeAllRecipeIndexEntriesForArticle('path/to/article');
			expect(result).toEqual(
				fakeRecords.flatMap(recipeDatabaseEntryToIndexEntries),
			);
			expect(mockDynamoClient.commandCalls(QueryCommand).length).toEqual(1);
			expect(
				mockDynamoClient.commandCalls(BatchWriteItemCommand).length,
			).toEqual(1);

			const q = mockDynamoClient.commandCalls(QueryCommand)[0]
				.firstArg as QueryCommand;
			expect(q.input.KeyConditionExpression).toEqual('capiArticleId=:artId');
			expect(q.input.ExpressionAttributeValues).toEqual({
				':artId': { S: 'path/to/article' },
			});

			const d = mockDynamoClient.commandCalls(BatchWriteItemCommand)[0]
				.firstArg as BatchWriteItemCommand;
			expect(
				(d.input.RequestItems ? d.input.RequestItems['TestTable'] : []).length,
			).toEqual(fakeRecords.length);
			for (let i = 0; i < fakeRecords.length; i++) {
				const item = d.input.RequestItems
					? d.input.RequestItems['TestTable'][i]
					: undefined;
				expect(item?.DeleteRequest?.Key).toEqual({
					capiArticleId: { S: fakeRecords[i].capiArticleId },
					recipeUID: { S: fakeRecords[i].recipeUID },
				});
			}
		});

		it('should not break if there is nothing to do', async () => {
			const fakeRecords: RecipeDatabaseEntry[] = [];
			mockDynamoClient.on(QueryCommand).resolves({
				Items: fakeRecords.map(recipeDatabaseEntryToDynamo),
			});
			mockDynamoClient.on(BatchWriteItemCommand).resolves({});

			const result =
				await removeAllRecipeIndexEntriesForArticle('path/to/article');
			expect(result).toEqual(
				fakeRecords.map(recipeDatabaseEntryToIndexEntries),
			);
			expect(mockDynamoClient.commandCalls(QueryCommand).length).toEqual(1);
			expect(
				mockDynamoClient.commandCalls(BatchWriteItemCommand).length,
			).toEqual(0);

			const q = mockDynamoClient.commandCalls(QueryCommand)[0]
				.firstArg as QueryCommand;
			expect(q.input.KeyConditionExpression).toEqual('capiArticleId=:artId');
			expect(q.input.ExpressionAttributeValues).toEqual({
				':artId': { S: 'path/to/article' },
			});
		});
	});

	describe('dynamodb.recipeByUID', () => {
		it('should return only v2 if asked for strictly v2', async () => {
			const fakeRecords: RecipeDatabaseEntry[] = [
				{
					capiArticleId: 'path/to/article',
					recipeUID: 'recep1',
					recipeVersion: 'recep1v2',
					versions: {
						v2: 'recep1v2',
						v3: 'recep1v3',
					},
					sponsorshipCount: 0,
					lastUpdated: new Date(),
				},
			];
			mockDynamoClient.on(QueryCommand).resolves({
				Items: fakeRecords.map(recipeDatabaseEntryToDynamo),
			});

			const result = await recipeByUID('recep1', 2, true);
			expect(result).toEqual([
				{
					capiArticleId: 'path/to/article',
					checksum: 'recep1v2',
					recipeUID: 'recep1',
					version: 2,
					sponsorshipCount: 0,
				},
			]);
		});

		it('should return only v3 if asked for strictly v3', async () => {
			const fakeRecords: RecipeDatabaseEntry[] = [
				{
					capiArticleId: 'path/to/article',
					recipeUID: 'recep1',
					recipeVersion: 'recep1v2',
					versions: {
						v2: 'recep1v2',
						v3: 'recep1v3',
					},
					sponsorshipCount: 0,
					lastUpdated: new Date(),
				},
			];
			mockDynamoClient.on(QueryCommand).resolves({
				Items: fakeRecords.map(recipeDatabaseEntryToDynamo),
			});

			const result = await recipeByUID('recep1', 3, true);
			expect(result).toEqual([
				{
					capiArticleId: 'path/to/article',
					checksum: 'recep1v3',
					recipeUID: 'recep1',
					version: 3,
					sponsorshipCount: 0,
				},
			]);
		});

		it('should return only v2 if asked for strictly v2 and only v2', async () => {
			const fakeRecords: RecipeDatabaseEntry[] = [
				{
					capiArticleId: 'path/to/article',
					recipeUID: 'recep1',
					recipeVersion: 'recep1v2',
					versions: {
						v2: 'recep1v2',
						v3: null,
					},
					sponsorshipCount: 0,
					lastUpdated: new Date(),
				},
			];
			mockDynamoClient.on(QueryCommand).resolves({
				Items: fakeRecords.map(recipeDatabaseEntryToDynamo),
			});

			const result = await recipeByUID('recep1', 2, true);
			expect(result).toEqual([
				{
					capiArticleId: 'path/to/article',
					checksum: 'recep1v2',
					recipeUID: 'recep1',
					version: 2,
					sponsorshipCount: 0,
				},
			]);
		});

		it('should return empty list if asked for strictly v3 and only v2', async () => {
			const fakeRecords: RecipeDatabaseEntry[] = [
				{
					capiArticleId: 'path/to/article',
					recipeUID: 'recep1',
					recipeVersion: 'recep1v2',
					versions: {
						v2: 'recep1v2',
						v3: null,
					},
					sponsorshipCount: 0,
					lastUpdated: new Date(),
				},
			];
			mockDynamoClient.on(QueryCommand).resolves({
				Items: fakeRecords.map(recipeDatabaseEntryToDynamo),
			});

			const result = await recipeByUID('recep1', 3, true);
			expect(result).toEqual([]);
		});

		it('should return v2 if asked for non-strict v3 and only v2', async () => {
			const fakeRecords: RecipeDatabaseEntry[] = [
				{
					capiArticleId: 'path/to/article',
					recipeUID: 'recep1',
					recipeVersion: 'recep1v2',
					versions: {
						v2: 'recep1v2',
						v3: null,
					},
					sponsorshipCount: 0,
					lastUpdated: new Date(),
				},
			];
			mockDynamoClient.on(QueryCommand).resolves({
				Items: fakeRecords.map(recipeDatabaseEntryToDynamo),
			});

			const result = await recipeByUID('recep1', 3, false);
			expect(result).toEqual([
				{
					capiArticleId: 'path/to/article',
					checksum: 'recep1v2',
					recipeUID: 'recep1',
					version: 2,
					sponsorshipCount: 0,
				},
			]);
		});
	});

	describe('dynamodb.multipleRecipesByUID', () => {
		it('should return v3 by default but fall back to v2 if v3 is not available', async () => {
			const fakeRecords = [
				{
					capiArticleId: 'path/to/article',
					recipeUID: 'recep1',
					recipeVersion: 'recep1v2',
					versions: {
						v2: 'recep1v2',
						v3: 'recep1v3',
					},
					sponsorshipCount: 0,
					lastUpdated: new Date(),
				},
				{
					capiArticleId: 'path/to/article',
					recipeUID: 'recep2',
					recipeVersion: 'recep2v2',
					versions: {
						v2: 'recep2v2',
						v3: null,
					},
					sponsorshipCount: 0,
					lastUpdated: new Date(),
				},
				{
					capiArticleId: 'path/to/article',
					recipeUID: 'recep3',
					recipeVersion: 'recep3v2',
					versions: {
						v2: 'recep3v2',
						v3: 'recep3v3',
					},
					sponsorshipCount: 0,
					lastUpdated: new Date(),
				},
				{
					capiArticleId: 'path/to/article',
					recipeUID: 'recep4',
					recipeVersion: 'recep4v2',
					versions: {
						v2: 'recep4v2',
						v3: null,
					},
					sponsorshipCount: 0,
					lastUpdated: new Date(),
				},
			]
				.map(recipeDatabaseEntryToDynamo)
				.map((e) => ({ Items: [e] }));
			// mockDynamoClient.on(QueryCommand).resolves({
			// 	Items: fakeRecords.map(recipeDatabaseEntryToDynamo),
			// });

			mockDynamoClient
				.on(QueryCommand)
				.resolvesOnce(fakeRecords[0])
				.resolvesOnce(fakeRecords[1])
				.resolvesOnce(fakeRecords[2])
				.resolvesOnce(fakeRecords[3])
				.rejects(new Error('Too many requests'));

			const result = await multipleRecipesByUid(
				['recep1', 'recep2', 'recep3', 'recep4'],
				3,
				false,
			);
			expect(result[0]).toEqual({
				capiArticleId: 'path/to/article',
				checksum: 'recep1v3',
				recipeUID: 'recep1',
				version: 3,
				sponsorshipCount: 0,
			});

			expect(result[1]).toEqual({
				capiArticleId: 'path/to/article',
				checksum: 'recep2v2',
				recipeUID: 'recep2',
				version: 2,
				sponsorshipCount: 0,
			});

			expect(result[2]).toEqual({
				capiArticleId: 'path/to/article',
				checksum: 'recep3v3',
				recipeUID: 'recep3',
				version: 3,
				sponsorshipCount: 0,
			});

			expect(result[3]).toEqual({
				capiArticleId: 'path/to/article',
				checksum: 'recep4v2',
				recipeUID: 'recep4',
				version: 2,
				sponsorshipCount: 0,
			});

			expect(result.length).toEqual(4);
		});
	});
});
