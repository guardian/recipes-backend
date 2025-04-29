import fs from 'fs';
import path from 'path';
import * as ejs from 'ejs';
import recipe from '../data/sampleRecipe.json';

describe('Sample recipe ', () => {
	it('should match snapshot', () => {
		const templatePath = path.join(__dirname, '../assets/recipe.ejs');
		const template = fs.readFileSync(templatePath, 'utf-8');
		const html = ejs.render(template, recipe);
		expect(html).toMatchSnapshot();
	});
});
