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

export async function downloadRecipeContent(
	recipeUuid: string,
): Promise<RecipeData> {
	const path = `${baseUrl}/api/content/by-uid/${recipeUuid}`;
	console.log(`Obtaining recipe data from ${path}`);
	const response = await fetch(path); //This should follow the redirect by default
	const content = await response.text();
	if (response.status == 200) {
		return JSON.parse(content) as RecipeData;
	} else {
		console.error(
			`Unable to retrieve recipe data: server responded ${response.status} ${content}`,
		);
		throw new Error(`Unable to retrieve recipe data`);
	}
}

export async function renderJsonToHtml(
	recipe: RecipeData,
	chefs: Record<string, ChefData>,
) {
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
		'You must pass the uuid of the recipe to render on the commandline!',
	);
	process.exit(2);
} else {
	//Get chefs and render html
	void (async () => {
		const chefsList = (await getChefs()) as Record<string, ChefData>;
		const recipeJson = await downloadRecipeContent(process.argv[2]);
		await renderJsonToHtml(recipeJson, chefsList);
	})().then(
		() => {
			console.log('Done');
			process.exit(0);
		},
		(err) => {
			console.error(err);
			process.exit(1);
		},
	);
}
