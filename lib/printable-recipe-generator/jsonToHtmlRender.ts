import { PrintableRecipe } from '../recipes-data/src';

const logoUrl =
	'https://s3-eu-west-1.amazonaws.com/static-content-dist/android/chromecast/theguardianlogo.png';

export function JsonToHtmlRenderer(recipe: PrintableRecipe): string {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${recipe.title}</title>
  <style>
    body { font-family: sans-serif; margin: 40px; }
    .header { display: flex; justify-content: space-between; }
    .recipe-title { font-size: 24px; font-weight: bold; margin: 1em 0 0.5em; }
    .author { font-size: 14px; color: #666; margin-bottom: 2em; }
    .info-box { margin-bottom: 2em; }
    .description { margin-bottom: 2em; }
    .content { display: flex; gap: 2em; margin-bottom: 2em; }
    .ingredients, .method { flex: 1; }
    .footer { border-top: 1px solid #ccc; padding-top: 1em; }
    .footer-bottom { border-top: 1px solid #ccc; margin-top: 1em; padding-top: 0.5em; }
  </style>
</head>
<body>
  <div class="header">
    <div><h1>Feast</h1></div>
    <div><img src="${
			logoUrl || 'https://via.placeholder.com/100x50?text=Logo'
		}" alt="Logo" height="50"/></div>
  </div>

  <div class="recipe-title">${recipe.title}</div>
  <div class="author">By ${recipe.contributors[0]}</div>

  <div class="info-box">
    <div><strong>Prep Time:</strong> ${recipe.timings}</div>
    <div><strong>Serves:</strong> ${recipe.serves}</div>
  </div>

  <div class="description">${recipe.description}</div>

  <div class="content">
    <div class="ingredients">
      <h3>Ingredients</h3>
      <ul>
        ${recipe.ingredients.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </div>
    <div class="method">
      <h3>Method</h3>
      <ol>
        ${recipe.instructions.map((step) => `<li>${step}</li>`).join('')}
      </ol>
    </div>
  </div>

  <div class="footer">
    <div>${recipe.footerTop}</div>
    <div class="footer-bottom">${recipe.footerBottom}</div>
  </div>
</body>
</html>
`;
}
