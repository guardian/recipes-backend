import fs from 'fs';
import * as process from 'node:process';
import path from 'path';
import { render as renderTemplate } from 'ejs';
import fetch from 'node-fetch';
import * as QRCode from 'qrcode';
import { fontsBase64, svgs } from './assets/assetloader';

const stage: string = process.env['STAGE'] ?? 'CODE';

const baseUrl =
	stage === 'PROD'
		? 'https://recipes.guardianapis.com'
		: 'https://recipes.code.dev-guardianapis.com';

//load Contributors
interface ChefData {
	webTitle: string;
	webUrl: string;
	apiUrl: string;
	bio?: string;
	bylineImageUrl?: string;
	bylineLargeImageUrl?: string;
}

interface RecipeData {
	id: string;
}
async function getChefs(): Promise<Record<string, ChefData> | undefined> {
	try {
		const endpoint = `${baseUrl}/v2/contributors.json`;
		console.log(`the stage found is ${stage}, endpoint is ${endpoint}`);
		const resp = await fetch(endpoint);
		const data = (await resp.json()) as Record<string, ChefData>;
		return data;
	} catch (error) {
		console.error(`Failed to parse chefs JSON: `, error);
		return undefined;
	}
}

export async function renderJsonToHtml(
	recipeDataPath: string,
	chefs: Record<string, ChefData>,
) {
	//load recipe JSON
	const recipe = JSON.parse(
		fs.readFileSync(recipeDataPath, 'utf-8'),
	) as RecipeData;

	//load QR Code
	const qrImageDataUrl = await QRCode.toDataURL(
		`feastbraze://recipe/${recipe.id}`,
	);

	//load template
	const templatePath = path.join(__dirname, 'src', 'assets', 'recipe.ejs');
	const template = fs.readFileSync(templatePath, 'utf-8');

	//Render html
	const renderHtml = renderTemplate(template, {
		recipe,
		svgs,
		fontsBase64,
		chefs,
		qrImageDataUrl,
	});

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
		await renderJsonToHtml(process.argv[2], chefsList);
	})();
}
