import { ProvisionedThroughputExceededException } from '@aws-sdk/client-dynamodb';
import { v4 as uuid } from 'uuid';
import { multipleRecipesByUid } from '@recipes-api/lib/recipes-data';
import {
	getBodyContentAsJson,
	recursivelyGetIdList,
	validateDateParam,
} from './helpers';

jest.mock('./config');
jest.mock('@recipes-api/lib/recipes-data');

describe('app.getBodyContentAsJson', () => {
	it('should pass back a string as-is', () => {
		expect(getBodyContentAsJson('{"hello":"test"}')).toEqual(
			'{"hello":"test"}',
		);
	});

	it('should object to a string that does not parse to json', () => {
		expect(() => getBodyContentAsJson('hello')).toThrow();
	});
	it('should convert an object into json string', () => {
		expect(getBodyContentAsJson({ hello: 'world' })).toEqual(
			'{"hello":"world"}',
		);
	});

	it('should convert an array into json string', () => {
		expect(getBodyContentAsJson([1, 2, 3])).toEqual('[1,2,3]');
	});
});

describe('app.validateDateParam', () => {
	it('should convert a valid date string into a Date object', () => {
		const result = validateDateParam('2024-06-05');
		expect(result?.getFullYear()).toEqual(2024);
		expect(result?.getMonth()).toEqual(5); //note - JS Date() object month index is Jan=>0, Feb=1
		expect(result?.getDate()).toEqual(5);
	});

	it('should reject a malformed string', () => {
		expect(() => validateDateParam('2014-06-05somethingmalicious')).toThrow(
			'Provided date was not valid',
		);
	});

	it('should reject an out-of-range string', () => {
		expect(() => validateDateParam('2024-96-05')).toThrow(
			'Invalid number of months',
		);

		expect(() => validateDateParam('1902-96-05')).toThrow('Invalid year');
	});
});

describe('app.recursivelyGetIdList', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('should batch up requests and send to the dynamo layer', async () => {
		(multipleRecipesByUid as jest.Mock).mockImplementation(
			(idList: string[]) => {
				return idList.map((uuid) => ({
					checksum: `cs-for-${uuid}`,
					recipeUID: uuid,
					capiArticleId: `article-for-${uuid}`,
					sponsorshipCount: 0,
				}));
			},
		);

		const uidList: string[] = [];

		for (let i = 0; i < 120; i++) {
			uidList.push(uuid());
		}

		const results = await recursivelyGetIdList(uidList, [], 2);
		expect(results.length).toEqual(120);
		expect(results.map((e) => e.recipeUID)).toEqual(uidList);
		//we expect there to have been 3 parallel batches
		expect((multipleRecipesByUid as jest.Mock).mock.calls.length).toEqual(3);
	});

	it('should retry if ProvisionedThroughputExceeded is caught', async () => {
		(multipleRecipesByUid as jest.Mock).mockImplementation(
			(idList: string[]) => {
				const shouldCrash = Math.random();
				if (shouldCrash < 0.05) {
					// @ts-ignore -- $metadata should not be null, but we are not reading it anyway
					throw new ProvisionedThroughputExceededException({
						$metadata: {},
						message: 'This is a test',
					});
				} else {
					return idList.map((uuid) => ({
						checksum: `cs-for-${uuid}`,
						recipeUID: uuid,
						capiArticleId: `article-for-${uuid}`,
						sponsorshipCount: 0,
					}));
				}
			},
		);

		const uidList: string[] = [];

		for (let i = 0; i < 120; i++) {
			uidList.push(uuid());
		}

		const results = await recursivelyGetIdList(uidList, [], 2);
		expect(results.length).toEqual(120);
		expect(results.map((e) => e.recipeUID)).toEqual(uidList);
		//we expect there to have been 3 parallel batches
		expect(
			(multipleRecipesByUid as jest.Mock).mock.calls.length,
		).toBeGreaterThanOrEqual(3);
	});
});
