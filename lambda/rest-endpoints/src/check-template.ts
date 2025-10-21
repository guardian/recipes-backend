import { com } from '@guardian/feast-multiplatform-library';
import { isEqual } from 'lodash-es';
import type { RecipeV3 } from '@recipes-api/lib/feast-models';
import { RecipeV2Schema } from '@recipes-api/lib/feast-models';
import scaleRecipe = com.gu.recipe.js.scaleRecipe;

function normaliseInstructionOrIngredient(instruction: string): string {
	return instruction
		.replace(/\/gas mark/g, '/gas') // we render template as `250F/gas 4`, but some of our recipes have `250F/gas mark 4`
		.replace(/'/g, '’') // funnily enough, sonnet doesn't have a token for fancy apostrophe
		.replace(/\u00A0/g, ' ') // replace non-breaking spaces with regular spaces
		.replace(/ +/g, ' ') // replace any double space
		.replace(/(\d+)(kg|g|cup|cups|tbsp|tsp|ml|L|cm|mm)\b/gi, '$1 $2'); // ensure there's a space between number and unit
}

export function checkTemplate(recipe: RecipeV3): {
	match: boolean;
	expected?: unknown;
	received?: unknown;
} {
	const result = scaleRecipe(JSON.stringify(recipe), 1, 'Metric');
	const scaledRecipe = RecipeV2Schema.parse(JSON.parse(result));
	const expected = {
		ingredients: recipe.ingredients?.flatMap((list) =>
			list.ingredientsList
				?.map((i) => i.text)
				.map(normaliseInstructionOrIngredient),
		),
		instructions: recipe.instructions
			?.map((i) => i.description)
			.map(normaliseInstructionOrIngredient),
	};
	const received = {
		ingredients: scaledRecipe.ingredients?.flatMap((list) =>
			list.ingredientsList
				?.map((i) => i.text)
				.map(normaliseInstructionOrIngredient),
		),
		instructions: scaledRecipe.instructions
			?.map((i) => i.description)
			.map(normaliseInstructionOrIngredient),
	};
	if (isEqual(expected, received)) {
		return {
			match: true,
		};
	} else {
		return {
			match: false,
			expected: expected,
			received: received,
		};
	}
}
