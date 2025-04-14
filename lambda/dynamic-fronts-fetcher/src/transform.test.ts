import type { Recipe } from '@recipes-api/lib/facia';
import type { IncomingDataRow } from './models';
import { convertBQReport } from './transform';

describe('convertBQReport', () => {
	const fakeRows: IncomingDataRow[] = [
		{ recipe_id: '123345', uniques: '32' },
		{ recipe_id: 'dsa', uniques: '30' },
		{ recipe_id: 'GFSD', uniques: '28' },
		{ recipe_id: 'vbcbbvcxz', uniques: '25' },
		{ recipe_id: 'vbsdghd', uniques: '22' },
		{ recipe_id: 'iuuytiynfd', uniques: '19' },
		{ recipe_id: 'asdc`zhj', uniques: '3' },
		{ recipe_id: 'jkghfjgfs', uniques: '-1' },
	];

	it('should take the country code and rows and return a printable container', () => {
		const result = convertBQReport('GB', fakeRows);
		expect(result.body).toBeUndefined();
		expect(result.targetedRegions).toEqual(['GB']);
		expect(result.excludedRegions).toEqual(undefined);
		expect(result.title).toEqual("What's hot in the United Kingdom");
		expect((result.items as Recipe[]).map((_) => _.recipe.id)).toEqual(
			fakeRows.map((_) => _.recipe_id),
		);
	});

	it('should take the country code and rows and return a printable container', () => {
		const result = convertBQReport('FR', fakeRows);
		expect(result.body).toBeUndefined();
		expect(result.targetedRegions).toEqual(['FR']);
		expect(result.excludedRegions).toEqual(undefined);
		expect(result.title).toEqual("What's hot in France");
		expect((result.items as Recipe[]).map((_) => _.recipe.id)).toEqual(
			fakeRows.map((_) => _.recipe_id),
		);
	});

	it('should not crash if the code is not recognised', () => {
		const result = convertBQReport('AXF', fakeRows);
		expect(result.body).toBeUndefined();
		expect(result.targetedRegions).toEqual(['AXF']);
		expect(result.excludedRegions).toEqual(undefined);
		expect(result.title).toEqual("What's hot near you");
	});

	it('should respect the sizeLimit parameter', () => {
		const result = convertBQReport('US', fakeRows, 3);
		expect(result.body).toBeUndefined();
		expect(result.targetedRegions).toEqual(['US']);
		expect(result.excludedRegions).toEqual(undefined);
		expect(result.title).toEqual("What's hot in the United States of America");
		expect(result.items.length).toEqual(3);
		expect((result.items as Recipe[]).map((_) => _.recipe.id)).toEqual([
			'123345',
			'dsa',
			'GFSD',
		]);
	});
});
