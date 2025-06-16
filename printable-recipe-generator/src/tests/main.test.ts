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
	'profile/yotamottolenghi': {
		webTitle: 'Yotam Ottolenghi',
		webUrl: 'http://www.code.dev-theguardian.com/profile/yotamottolenghi',
		apiUrl: 'http://content.code.dev-guardianapis.com/profile/yotamottolenghi',
		bio: "<p>Originally from Jerusalem, Yotam Ottolenghi is a London-based restaurateur and food writer. He runs Nopi and Ottolenghi, and is the author of three bestselling books; his fourth book, <a href='http://www.guardianbookshop.co.uk/BerteShopWeb/viewProduct.do?ISBN=9780091957155\" title=''>Plenty More</a>, is published in September 2014</p>",
		bylineImageUrl:
			'https://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2014/4/17/1397749341692/YotamOttolenghi.jpg',
		bylineLargeImageUrl:
			'https://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2014/3/13/1394733751371/YotamOttolenghi.png',
	},
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
			qrImageDataUrl: '',
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
			chefs: undefined,
			qrImageDataUrl: '',
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
			qrImageDataUrl: '',
		});
		expect(html).toMatchSnapshot();
	});

	it('should match snapshot even when chefs list is empty', () => {
		const templatePath = path.join(__dirname, '../assets/recipe.ejs');
		const template = fs.readFileSync(templatePath, 'utf-8');
		const html = ejs.render(template, {
			recipe,
			svgs,
			fontsBase64,
			chefs: [],
			qrImageDataUrl: '',
		});
		expect(html).toMatchSnapshot();
	});

	it('should match snapshot even when chefs list contains more then 1 chef', () => {
		const templatePath = path.join(__dirname, '../assets/recipe.ejs');
		const template = fs.readFileSync(templatePath, 'utf-8');
		const html = ejs.render(template, {
			recipe,
			svgs,
			fontsBase64,
			chefs: chefs,
			qrImageDataUrl: '',
		});
		expect(html).toContain('Yotam Ottolenghi');
		expect(html).toContain('Nigel Slater');
		expect(html).toMatchSnapshot();
	});

	it('should match snapshot when QR code is present', () => {
		const templatePath = path.join(__dirname, '../assets/recipe.ejs');
		const template = fs.readFileSync(templatePath, 'utf-8');
		const qrImageDataUrl =
			'data:image/png;base64,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';
		const html = ejs.render(template, {
			recipe,
			svgs,
			fontsBase64,
			chefs,
			qrImageDataUrl,
		});
		expect(html).toMatchSnapshot();
	});

	it('should match snapshot when QR code is not present', () => {
		const templatePath = path.join(__dirname, '../assets/recipe.ejs');
		const template = fs.readFileSync(templatePath, 'utf-8');
		const html = ejs.render(template, {
			recipe,
			svgs,
			fontsBase64,
			chefs,
			qrImageDataUrl: null,
		});
		expect(html).toMatchSnapshot();
	});
});
