import { JsonToHtmlRenderer } from './jsonToHtmlRender';
// @ts-ignore
//import { sampleRecipe } from './sampleRecipeTest.json';
import sampleRecipe from './sampleRecipeTest.json' assert { type: 'json' };
import fs from 'fs';

const resultSampleHtml = JsonToHtmlRenderer(sampleRecipe);
fs.writeFileSync('recipe-output.html', resultSampleHtml);
console.log('HTML written to recipe-output.html');
