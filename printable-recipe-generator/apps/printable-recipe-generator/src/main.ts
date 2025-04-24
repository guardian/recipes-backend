import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import express from 'express';

// @ts-ignore
//import data from '../src/data/sampleRecipe.json';

function renderJsonToHtml() {
  //load recipe JSON
  const recipeDataPath = path.join(
    process.cwd(),
    'apps',
    '/printable-recipe-generator',
    'src',
    'data',
    'sampleRecipe.json'
  );
  const recipe = JSON.parse(fs.readFileSync(recipeDataPath, 'utf-8'));

  //load template
  const templatePath = path.join(
    process.cwd(),
    'apps',
    '/printable-recipe-generator',
    'templates',
    'recipe.ejs'
  );
  const template = fs.readFileSync(templatePath, 'utf-8');

  //Render html
  let renderHtml = '';
  try {
    renderHtml = ejs.render(template, recipe);
  } catch (error) {
    console.error('Failed to render template: ', (error as Error).message);
    //console.error('Recipe data was: ', JSON.stringify(recipe, null, 2));
    process.exit(1);
  }

  //Output
  const outputPath = path.join(__dirname, 'output', 'recipe.html');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, renderHtml);

  console.log(`Rendered HTML saved to ${outputPath}`);
}

const app = express();

app.set('view engine', 'ejs');
//app.use(express.static('public'));

app.get('/', (req, res) => {
  renderJsonToHtml();
});
app.get('/print', (req, res) => {
  res.sendFile(path.join(__dirname + '/output/recipe.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at port: ${PORT}`);
});
