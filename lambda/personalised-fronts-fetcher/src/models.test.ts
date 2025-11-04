import { IncomingDataRow } from './models';

describe('IncomingDataRaw', () => {
	/*it('should validate newer style IDs', () => {
		const test = {
			recipe_id: '5face40040dd47f690b9d65dfd6e2021',
			uniques: '7',
		};

		const parsed = IncomingDataRow.safeParse(test);
		expect(parsed.success).toBeTruthy();
	});

	it('should validate older style IDs', () => {
		const test = {
			recipe_id: 'gu-recipe-1244fcf6-601f-4972-8579-1bac76d3f886',
			uniques: '7',
		};

		const parsed = IncomingDataRow.safeParse(test);
		expect(parsed.success).toBeTruthy();
	});

	 */
	it('should reject invalid IDs', () => {
		const test = {
			identityId: 'user-12345',
			top_accessed_recipes: ['invalid-recipe-id', 'another-bad-id!'],
		};

		const parsed = IncomingDataRow.safeParse(test);
		expect(parsed.success).toBeFalsy();
	});
});
