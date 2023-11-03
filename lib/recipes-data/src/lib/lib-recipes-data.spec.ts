import { libRecipesData } from './lib-recipes-data';

describe('libRecipesData', () => {
	it('should work', () => {
		expect(libRecipesData()).toEqual('lib-recipes-data');
	});
});
