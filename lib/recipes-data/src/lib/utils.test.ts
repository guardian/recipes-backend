import type { RecipeReferenceWithoutChecksum } from './models';
import { calculateChecksum, extractCropIdFromGuimUrl } from './utils';

jest.mock('./config', () => ({}));

describe('calculateChecksum', () => {
	it('should checksum the content into base64', () => {
		const input: RecipeReferenceWithoutChecksum = {
			recipeUID: 'blahblah',
			jsonBlob: 'foodisgoodwatchitburn',
		};
		const result = calculateChecksum(input);
		expect(result.recipeUID).toEqual(input.recipeUID);
		expect(result.jsonBlob).toEqual(input.jsonBlob);
		expect(result.checksum).toEqual(
			'6rIHocBjte3q9jPnLtzQhtFsDabFUKQGVk3VMuorRB8',
		);
	});
});

describe('extractCropIdFromGuimUrl', () => {
	const assertCropId = (url: string, cropId: string) =>
		expect(extractCropIdFromGuimUrl(url)).toBe(cropId);

	it('should find a crop id', () => {
		const urlsToAssert = [
			[
				'https://media.guim.co.uk/902a2c387ba62c49ad7553c2712eb650e73eb5b2/258_0_7328_4400/2000.jpg',
				'258_0_7328_4400',
			],
			[
				'https://media.guim.co.uk/7f27c01fda5284d609a26ad4acb28443241ec6b3/5_2110_2299_1379/1000.jpg',
				'5_2110_2299_1379',
			],
			[
				'https://media.guim.co.uk/13d94f7cf33f17a22da3d93a121623899e7da76e/0_0_3713_4378/1696.jpg',
				'0_0_3713_4378',
			],
			[
				'https://media.guim.co.uk/affead41f14556fa03c18391aceae2ac8a5a9449/0_0_4000_5097/1570.jpg',
				'0_0_4000_5097',
			],
			[
				'https://media.guim.co.uk/a1212c7bc9ddc45a79d274ee12b4fdc724c8a022/0_456_4000_5225/1531.jpg',
				'0_456_4000_5225',
			],
			[
				'https://media.guim.co.uk/0204e0aa54caa8687a6627d6426fe06c38406f57/4002_593_3975_4970/1600.jpg',
				'4002_593_3975_4970',
			],
			[
				'https://media.guim.co.uk/7ca187c030131b5db1c335688044f379210a78bc/0_0_6426_5086/2000.jpg',
				'0_0_6426_5086',
			],
			[
				' https://media.guim.co.uk/945038b08cdf48ecc21de52d1c75a34c85bbfc92/37_54_5422_5419/5422.jpg',
				'37_54_5422_5419',
			],
			[
				'https://media.guim.co.uk/7491ae2cb948d91ca71334cd6a9eeb83cbde6615/149_295_4923_4920/4923.jpg',
				'149_295_4923_4920',
			],
			[
				'https://media.guim.co.uk/d7964a461c5ce4449395da3ee800965b4cb252b7/705_779_3876_3873/3876.jpg',
				'705_779_3876_3873',
			],
		];

		urlsToAssert.forEach(([url, cropId]) => assertCropId(url, cropId));
	});

	it('should not give a crop id for a non-image URL with the same number of path segments', () => {
		expect(
			extractCropIdFromGuimUrl(
				'https://another-url.co.uk/some-other-id/a-third-id/2000.jpg',
			),
		).toBe(undefined);
	});

	it('should not give a crop id for a non-image URL', () => {
		expect(extractCropIdFromGuimUrl('https://google.com')).toBe(undefined);
	});
});
