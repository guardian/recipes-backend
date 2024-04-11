import type { RecipeReferenceWithoutChecksum } from './models';
import { calculateChecksum, extractCropDataFromGuimUrl } from './utils';

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
	const assertCropId = (
		url: string,
		mediaId: string,
		cropId: string,
		width: number,
	) =>
		expect(extractCropDataFromGuimUrl(url)).toEqual({ mediaId, cropId, width });

	it('should find a crop id', () => {
		const cropDataToAssert = [
			[
				'https://media.guim.co.uk/902a2c387ba62c49ad7553c2712eb650e73eb5b2/258_0_7328_4400/2000.jpg',
				'902a2c387ba62c49ad7553c2712eb650e73eb5b2',
				'258_0_7328_4400',
				7328,
			],
			[
				'https://media.guim.co.uk/7f27c01fda5284d609a26ad4acb28443241ec6b3/5_2110_2299_1379/1000.jpg',
				'7f27c01fda5284d609a26ad4acb28443241ec6b3',
				'5_2110_2299_1379',
				2299,
			],
			[
				'https://media.guim.co.uk/13d94f7cf33f17a22da3d93a121623899e7da76e/0_0_3713_4378/1696.jpg',
				'13d94f7cf33f17a22da3d93a121623899e7da76e',
				'0_0_3713_4378',
				3713,
			],
			[
				'https://media.guim.co.uk/affead41f14556fa03c18391aceae2ac8a5a9449/0_0_4000_5097/1570.jpg',
				'affead41f14556fa03c18391aceae2ac8a5a9449',
				'0_0_4000_5097',
				4000,
			],
			[
				'https://media.guim.co.uk/a1212c7bc9ddc45a79d274ee12b4fdc724c8a022/0_456_4000_5225/1531.jpg',
				'a1212c7bc9ddc45a79d274ee12b4fdc724c8a022',
				'0_456_4000_5225',
				4000,
			],
			[
				'https://media.guim.co.uk/0204e0aa54caa8687a6627d6426fe06c38406f57/4002_593_3975_4970/1600.jpg',
				'0204e0aa54caa8687a6627d6426fe06c38406f57',
				'4002_593_3975_4970',
				3975,
			],
			[
				'https://media.guim.co.uk/7ca187c030131b5db1c335688044f379210a78bc/0_0_6426_5086/2000.jpg',
				'7ca187c030131b5db1c335688044f379210a78bc',
				'0_0_6426_5086',
				6426,
			],
			[
				' https://media.guim.co.uk/945038b08cdf48ecc21de52d1c75a34c85bbfc92/37_54_5422_5419/5422.jpg',
				'945038b08cdf48ecc21de52d1c75a34c85bbfc92',
				'37_54_5422_5419',
				5422,
			],
			[
				'https://media.guim.co.uk/7491ae2cb948d91ca71334cd6a9eeb83cbde6615/149_295_4923_4920/4923.jpg',
				'7491ae2cb948d91ca71334cd6a9eeb83cbde6615',
				'149_295_4923_4920',
				4923,
			],
			[
				'https://media.guim.co.uk/d7964a461c5ce4449395da3ee800965b4cb252b7/705_779_3876_3873/3876.jpg',
				'd7964a461c5ce4449395da3ee800965b4cb252b7',
				'705_779_3876_3873',
				3876,
			],
			[
				'https://media.guim.co.uk/902a2c387ba62c49ad7553c2712eb650e73eb5b2/258_0_7328_4400/2000.jpg',
				'902a2c387ba62c49ad7553c2712eb650e73eb5b2',
				'258_0_7328_4400',
				7328,
			],
			[
				'https://media-origin.test.dev-guim.co.uk/db8f3a6b81112d50a37f7ea79259d3f0d97a0642/0_0_2448_3264/master/2448.jpg?width=1600&dpr=1&s=none',
				'db8f3a6b81112d50a37f7ea79259d3f0d97a0642',
				'0_0_2448_3264',
				2448,
			],
      [
        'https://s3-eu-west-1.amazonaws.com/media-origin.test.dev-guim.co.uk/db8f3a6b81112d50a37f7ea79259d3f0d97a0642/0_0_2448_3264/2448.jpg',
        'db8f3a6b81112d50a37f7ea79259d3f0d97a0642',
				'0_0_2448_3264',
				2448,
      ]
		] as const;

		cropDataToAssert.forEach(([url, mediaId, cropId, width]) =>
			assertCropId(url, mediaId, cropId, width),
		);
	});

	it('should not give a crop id for a non-image URL with the same number of path segments', () => {
		expect(
			extractCropDataFromGuimUrl(
				'https://another-url.co.uk/some-other-id/a-third-id/2000.jpg',
			),
		).toBe(undefined);
	});

	it('should not give a crop id for a non-image URL', () => {
		expect(extractCropDataFromGuimUrl('https://google.com')).toBe(undefined);
	});
});
