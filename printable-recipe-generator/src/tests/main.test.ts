import fs from 'fs';
import path from 'path';
import * as ejs from 'ejs';
import { fontsBase64, svgs } from '../assets/assetloader';
import recipe from '../data/sampleRecipe.json';

//load Contributors
interface ChefData {
	webTitle: string;
	webUrl: string;
	apiUrl: string;
	bio?: string;
	bylineImageUrl?: string;
	bylineLargeImageUrl?: string;
}

const chefs: Record<string, ChefData> = {
	'profile/nigelslater': {
		webTitle: 'Nigel Slater',
		webUrl: 'http://www.code.dev-theguardian.com/profile/nigelslater',
		apiUrl: 'http://content.code.dev-guardianapis.com/profile/nigelslater',
		bio: "<p>Nigel Slater has been the Observer's food writer for 20 years. His cookery books, which include Appetite, Eat and the Kitchen Diaries have won a host of awards, while his autobiography Toast – The Story of a Boy's Hunger was adapted by BBC Films, starring Helena Bonham Carter and Freddie Highmore</p>",
		bylineImageUrl:
			'https://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2014/4/17/1397749337461/NigelSlaterLv2.jpg',
		bylineLargeImageUrl:
			'https://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2014/4/17/1397762419839/NigelSlater.png',
	},
	'profile/claireptak': {
		webTitle: 'Claire Ptak',
		webUrl: 'http://www.code.dev-theguardian.com/profile/claireptak',
		apiUrl: 'http://content.code.dev-guardianapis.com/profile/claireptak',
	},
};
describe('Sample recipe ', () => {
	it('should match snapshot', () => {
		const templatePath = path.join(__dirname, '../assets/recipe.ejs');
		const template = fs.readFileSync(templatePath, 'utf-8');
		const html = ejs.render(template, {
			recipe,
			svgs,
			fontsBase64,
			chefs,
		});
		expect(html).toMatchSnapshot();
	});

	it('should match snapshot even when chefs are undefined', () => {
		const templatePath = path.join(__dirname, '../assets/recipe.ejs');
		const template = fs.readFileSync(templatePath, 'utf-8');
		const html = ejs.render(template, {
			recipe,
			svgs,
			fontsBase64,
			undefined,
		});
		expect(html).toMatchSnapshot();
	});

	it('should match snapshot even when chefs list is null', () => {
		const templatePath = path.join(__dirname, '../assets/recipe.ejs');
		const template = fs.readFileSync(templatePath, 'utf-8');
		const html = ejs.render(template, {
			recipe,
			svgs,
			fontsBase64,
			chefs: null,
		});
		expect(html).toMatchSnapshot();
	});
});
