import fs from 'fs';
import path from 'path';
import * as ejs from 'ejs';
import recipe from '../data/sampleRecipe.json';

//load SVGs
const svgPath = (fileName: string) =>
	path.join(__dirname, '../assets/svgs', fileName);

const svgs = {
	FeastLogo: fs.readFileSync(svgPath('FeastLogo.svg'), 'utf-8'),
	TheGuardianLogo: fs.readFileSync(svgPath('TheGuardianLogo.svg'), 'utf-8'),
	'dairy-free': fs.readFileSync(svgPath('dairy-free.svg'), 'utf-8'),
	'gluten-free': fs.readFileSync(svgPath('gluten-free.svg'), 'utf-8'),
	vegan: fs.readFileSync(svgPath('vegan.svg'), 'utf-8'),
	vegetarian: fs.readFileSync(svgPath('vegetarian.svg'), 'utf-8'),
	camera: fs.readFileSync(svgPath('camera.svg'), 'utf-8'),
	'feast-book-outlined': fs.readFileSync(
		svgPath('feast-book-outlined.svg'),
		'utf-8',
	),
};

describe('Sample recipe ', () => {
	it('should match snapshot', () => {
		const templatePath = path.join(__dirname, '../assets/recipe.ejs');
		const template = fs.readFileSync(templatePath, 'utf-8');
		const html = ejs.render(template, { recipe, svgs });
		expect(html).toMatchSnapshot();
	});
});
