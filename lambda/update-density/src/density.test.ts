import { parseDensityCSV } from './density';

jest.mock('@recipes-api/lib/recipes-data', () => ({
	...jest.requireActual('@recipes-api/lib/recipes-data'),
	getFastlyApiKey: () => 'fake-api-key',
	getStaticBucketName: () => 'test-bucket',
}));

describe('parseDensityCSV', () => {
	it('should handle correctly formatted data', () => {
		const content = `982,Almonds (ground),ground almond,0.83,./datasets/guardian-2.csv
983,Almonds (whole),almond,0.71,./datasets/guardian-2.csv
984,"Basil (whole, inc stalk)",basil,3.33,./datasets/guardian-2.csv
985,Basil (whole leaves),basil,6.67,./datasets/guardian-2.csv
986,Basil (chopped),chopped basil,2.5,./datasets/guardian-2.csv
987,Breadcrumbs (dried),dried breadcrumb,1.18,./datasets/guardian-2.csv
988,Breadcrumbs (fresh),fresh breadcrumb,1.67,./datasets/guardian-2.csv
989,Buckwheat flour,buckwheat flour,0.74,./datasets/guardian-2.csv
990,Bulgur wheat,bulgur wheat,0.5,./datasets/guardian-2.csv
991,Butter (cubed),diced butter,0.67,./datasets/guardian-2.csv
992,Butter (softened or melted),butter,0.44,./datasets/guardian-2.csv
993,Cashews (whole),cashew,0.74,./datasets/guardian-2.csv
994,"Cheese (cheddar, grated)",grated cheddar,1,./datasets/guardian-2.csv`;

		const result = parseDensityCSV(content);
		expect(result.length).toEqual(13);
		expect(result[0]?.density).toEqual(0.83);
		expect(result[0]?.normalised_name).toEqual('ground almond');
	});

	it('should accept a header row', () => {
		const content = `ID,Ingredient name, normalised name, density,original source
982,Almonds (ground),ground almond,0.83,./datasets/guardian-2.csv
983,Almonds (whole),almond,0.71,./datasets/guardian-2.csv
984,"Basil (whole, inc stalk)",basil,3.33,./datasets/guardian-2.csv
985,Basil (whole leaves),basil,6.67,./datasets/guardian-2.csv
986,Basil (chopped),chopped basil,2.5,./datasets/guardian-2.csv
987,Breadcrumbs (dried),dried breadcrumb,1.18,./datasets/guardian-2.csv
988,Breadcrumbs (fresh),fresh breadcrumb,1.67,./datasets/guardian-2.csv
989,Buckwheat flour,buckwheat flour,0.74,./datasets/guardian-2.csv
990,Bulgur wheat,bulgur wheat,0.5,./datasets/guardian-2.csv
991,Butter (cubed),diced butter,0.67,./datasets/guardian-2.csv
992,Butter (softened or melted),butter,0.44,./datasets/guardian-2.csv
993,Cashews (whole),cashew,0.74,./datasets/guardian-2.csv
994,"Cheese (cheddar, grated)",grated cheddar,1,./datasets/guardian-2.csv`;

		const result = parseDensityCSV(content);
		expect(result[0]?.density).toEqual(0.83);
		expect(result[0]?.normalised_name).toEqual('ground almond');

		expect(result.length).toEqual(13);
	});

	it('should reject malformed data', () => {
		const content = `Almonds (ground),ground almond,0.83,./datasets/guardian-2.csv
Almonds (whole),almond,0.71,./datasets/guardian-2.csv
"Basil (whole, inc stalk)",basil,3.33,./datasets/guardian-2.csv`;

		expect(() => parseDensityCSV(content)).toThrow();
	});

	it('should reject partially malformed data', () => {
		const content = `982,Almonds (ground), 0.83,./datasets/guardian-2.csv
983,Almonds (whole), 0.71,./datasets/guardian-2.csv
984,"Basil (whole, inc stalk)",basil,3.33,./datasets/guardian-2.csv
985,Basil (whole leaves),basil,6.67,./datasets/guardian-2.csv`;

		expect(() => parseDensityCSV(content)).toThrow();
	});

	it('should accept partially malformed data if instructed to', () => {
		const content = `982,Almonds (ground), 0.83,./datasets/guardian-2.csv
983,Almonds (whole), 0.71,./datasets/guardian-2.csv
984,"Basil (whole, inc stalk)",basil,3.33,./datasets/guardian-2.csv
985,Basil (whole leaves),basil,6.67,./datasets/guardian-2.csv`;

		const result = parseDensityCSV(content, true);
		expect(result.length).toEqual(2);
	});

	it('should reject empty data', () => {
		expect(() => parseDensityCSV('')).toThrow();
	});
});
