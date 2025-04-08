import 'source-map-support/register';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { ReadMyRecipe } from '../lib/read-my-recipe';
import { RecipesBackend } from '../lib/recipes-backend';

const app = new GuRoot();
new RecipesBackend(app, 'RecipesBackend-euwest-1-CODE', {
	stack: 'feast',
	stage: 'CODE',
	env: { region: 'eu-west-1' },
});
new RecipesBackend(app, 'RecipesBackend-euwest-1-PROD', {
	stack: 'feast',
	stage: 'PROD',
	env: { region: 'eu-west-1' },
});
new ReadMyRecipe(app, 'ReadMyRecipe-useast-1-CODE', {
	stack: 'feast',
	stage: 'CODE',
	env: { region: 'us-east-1' },
});
