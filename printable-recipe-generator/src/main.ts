import fs from 'fs';
import * as process from 'node:process';
import path from 'path';
import type { Data } from 'ejs';
import { render as renderTemplate } from 'ejs';
import fetch from 'node-fetch';
import { fontsBase64, svgs } from './assets/assetloader';

const stage: string | undefined = process.env['STAGE'];

//load Contributors
interface ChefData {
	webTitle: string;
	webUrl: string;
	apiUrl: string;
	bio?: string;
	bylineImageUrl?: string;
	bylineLargeImageUrl?: string;
}
async function getChefs(): Promise<Record<string, ChefData> | undefined> {
	try {
		const endpoint: string =
			stage === 'PROD'
				? 'https://recipes.guardianapis.com/v2/contributors.json'
				: stage === 'CODE'
				? 'https://recipes.code.dev-guardianapis.com/v2/contributors.json'
				: '';
		const resp = await fetch(endpoint);
		const data = (await resp.json()) as Record<string, ChefData>;
		return data;
	} catch (error) {
		console.error('Failed to parse chefs JSON: ', error);
		return undefined;
	}
}

export function renderJsonToHtml(
	recipeDataPath: string,
	chefs: Record<string, unknown>,
) {
	//load recipe JSON
	const recipe = JSON.parse(
		fs.readFileSync(recipeDataPath, 'utf-8'),
	) as unknown;

	//load template
	const templatePath = path.join(__dirname, 'src', 'assets', 'recipe.ejs');
	const template = fs.readFileSync(templatePath, 'utf-8');

	//Render html
	let renderHtml = '';
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
	//Get chefs and render html
	void (async () => {
		const chefsList = (await getChefs()) as Record<string, ChefData>;
		renderJsonToHtml(process.argv[2], chefsList);
	})();
}
