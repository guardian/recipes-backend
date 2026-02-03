import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import { recipeIndexEntriesFromDynamo } from './models';

describe('recipeIndexEntriesFromDynamo', () => {
	it('should correctly parse a legacy record with sponorship data', () => {
		const rec: Record<string, AttributeValue> = {
			capiArticleId: {
				S: 'lifeandstyle/article/2024/aug/19/testing-sponsor-article-for-v2',
			},
			recipeUID: {
				S: '714c4bce-564d-4df6-b03b-9e71599d58a2',
			},
			lastUpdated: {
				S: '2024-08-19T09:03:48Z',
			},
			recipeVersion: {
				S: 'USCVJcb1xwRxTG2RFoYSrpBukTe71ZUm6uZNdvFU_bA',
			},
			sponsorshipCount: {
				N: '1',
			},
		};
		const results = recipeIndexEntriesFromDynamo(rec);
		expect(results.length).toEqual(1);
		const result = results[0];
		expect(result.sponsorshipCount).toEqual(1);
		expect(result.capiArticleId).toEqual(
			'lifeandstyle/article/2024/aug/19/testing-sponsor-article-for-v2',
		);
		expect(result.recipeUID).toEqual('714c4bce-564d-4df6-b03b-9e71599d58a2');
		expect(result.checksum).toEqual(
			'USCVJcb1xwRxTG2RFoYSrpBukTe71ZUm6uZNdvFU_bA',
		);
	});
	it('should correctly parse a new record with sponsorship and version data', () => {
		const rec: Record<string, AttributeValue> = {
			capiArticleId: {
				S: 'lifeandstyle/article/2024/aug/19/testing-sponsor-article-for-v2',
			},
			recipeUID: {
				S: '714c4bce-564d-4df6-b03b-9e71599d58a2',
			},
			lastUpdated: {
				S: '2024-08-19T09:03:48Z',
			},
			versions: {
				M: {
					v2: { S: 'version2Hash' },
					v3: { S: 'version3Hash' },
				},
			},
			sponsorshipCount: {
				N: '1',
			},
		};
		const results = recipeIndexEntriesFromDynamo(rec);
		expect(results.length).toEqual(2);
		const firstResult = results[0];
		expect(firstResult.sponsorshipCount).toEqual(1);
		expect(firstResult.capiArticleId).toEqual(
			'lifeandstyle/article/2024/aug/19/testing-sponsor-article-for-v2',
		);
		expect(firstResult.recipeUID).toEqual(
			'714c4bce-564d-4df6-b03b-9e71599d58a2',
		);
		expect(firstResult.checksum).toEqual('version2Hash');
		expect(firstResult.version).toEqual(2);
		const secondResult = results[1];
		expect(secondResult.sponsorshipCount).toEqual(1);
		expect(secondResult.capiArticleId).toEqual(
			'lifeandstyle/article/2024/aug/19/testing-sponsor-article-for-v2',
		);
		expect(secondResult.recipeUID).toEqual(
			'714c4bce-564d-4df6-b03b-9e71599d58a2',
		);
		expect(secondResult.checksum).toEqual('version3Hash');
		expect(secondResult.version).toEqual(3);
	});
});
