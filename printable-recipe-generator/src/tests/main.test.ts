import fs from 'fs';
import path from 'path';
import * as ejs from 'ejs';
import recipe from '../data/sampleRecipe.json';

//load SVGs
const svgPath = (fileName: string) =>
	path.join(__dirname, '../assets/svgs/', fileName);

const svgs = {
	FeastLogo: fs.readFileSync(svgPath('FeastLogo.svg'), 'utf-8'),
	TheGuardianLogo: fs.readFileSync(svgPath('TheGuardianLogo.svg'), 'utf-8'),
	'dairy-free': fs.readFileSync(svgPath('Dairy-free.svg'), 'utf-8'),
	'gluten-free': fs.readFileSync(svgPath('Gluten-free.svg'), 'utf-8'),
	vegan: fs.readFileSync(svgPath('Vegan.svg'), 'utf-8'),
	vegetarian: fs.readFileSync(svgPath('Vegetarian.svg'), 'utf-8'),
	camera: fs.readFileSync(svgPath('camera.svg'), 'utf-8'),
	'feast-book-outlined': fs.readFileSync(
		svgPath('feast-book-outlined.svg'),
		'utf-8',
	),
};

//load fonts
const fontPath = (fileName: string) =>
	path.join(__dirname, '../assets/fonts/', fileName);
const fontsBase64 = {
	RegularEgyptianFont: fs
		.readFileSync(fontPath('GuardianTextEgyptian-Regular.ttf'))
		.toString('base64'),
	RegularSansFont: fs
		.readFileSync(fontPath('GuardianTextSans-Regular.ttf'))
		.toString('base64'),
	HeadlineSemiBoldFont: fs
		.readFileSync(fontPath('GHGuardianHeadline-Semibold.otf'))
		.toString('base64'),
	SansBoldFont: fs
		.readFileSync(fontPath('GuardianTextSans-Bold.ttf'))
		.toString('base64'),
};

describe('Sample recipe ', () => {
	it('should match snapshot', () => {
		const templatePath = path.join(__dirname, '../assets/recipe.ejs');
		const template = fs.readFileSync(templatePath, 'utf-8');
		const html = ejs.render(template, { recipe, svgs, fontsBase64 });
		expect(html).toMatchSnapshot();
	});
});
