import fs from 'fs';
import * as process from 'node:process';
import path from 'path';
import type { Data } from 'ejs';
import { render as renderTemplate } from 'ejs';

function renderJsonToHtml(recipeDataPath: string) {
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
		renderHtml = renderTemplate(template, recipe as Data);
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
	renderJsonToHtml(process.argv[2]);
}
