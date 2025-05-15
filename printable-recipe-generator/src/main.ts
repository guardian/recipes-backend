import fs from 'fs';
import * as process from 'node:process';
import path from 'path';
import type { Data } from 'ejs';
import { render as renderTemplate } from 'ejs';
import fetch from 'node-fetch';

//load Contributors
async function getChefs() {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment --we know
	const resp = await fetch(
		'https://recipes.guardianapis.com/v2/contributors.json',
	);
	return resp.json();
}

function renderJsonToHtml(
	recipeDataPath: string,
	chefs: Record<string, unknown>,
) {
	//load SVGs
	const svgPath = (fileName: string) =>
		path.join(__dirname, 'src', 'assets', 'svgs', fileName);

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
		path.join(__dirname, 'src', 'assets', 'fonts', fileName);
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

	//load recipe JSON
	const recipe = JSON.parse(
		fs.readFileSync(recipeDataPath, 'utf-8'),
	) as unknown;

	//load template
	const templatePath = path.join(__dirname, 'src', 'assets', 'recipe.ejs');
	const template = fs.readFileSync(templatePath, 'utf-8');

	//Render html
	let renderHtml = '';
	// @ts-expect-error -- we know this
	console.log(chefs['profile/yotamottolenghi'].webTitle); //TODO to test - it worked here, not sure why it is not available to EJS file
	try {
		renderHtml = renderTemplate(template, {
			recipe,
			svgs,
			fontsBase64,
			chefs,
		} as Data);
	} catch (error) {
		console.error('Failed to render template: ', (error as Error).message);
		//console.error('Recipe data was: ', JSON.stringify(recipe, null, 2));
		process.exit(1);
	}

	//Output
	const outputPath =
		process.argv[3] ?? path.join(__dirname, 'output', 'recipe.html');
	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	fs.writeFileSync(outputPath, renderHtml);

	console.log(`Rendered HTML saved to ${outputPath}`);
}

if (!process.argv[2]) {
	console.error(
		'You must pass the name of the json file to render on the commandline!',
	);
	process.exit(2);
} else {
	//Get chefs
	(async () => {
		const chefsList = await getChefs();
		console.log(chefsList['profile/yotamottolenghi'].webTitle); //TODO to test - it worked here, not sure why it is not available to EJS file
		renderJsonToHtml(process.argv[2], chefsList); //.catch(console.error);
	})();
}
