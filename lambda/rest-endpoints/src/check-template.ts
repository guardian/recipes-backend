import { com } from '@guardian/feast-multiplatform-library';
import { isEqual } from 'lodash-es';
import type { RecipeV3 } from '@recipes-api/lib/feast-models';
import { RecipeV2Schema } from '@recipes-api/lib/feast-models';
import scaleRecipe = com.gu.recipe.js.scaleRecipe;

function normaliseInstruction(instruction: string): string {
	// we render template as `250F/gas 4`, but some of our recipes have `250F/gas mark 4`
	return instruction.replace(/\/gas mark/g, '/gas');
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
			list.ingredientsList?.map((i) => i.text),
		),
		instructions: recipe.instructions
			?.map((i) => i.description)
			.map(normaliseInstruction),
	};
	const received = {
		ingredients: scaledRecipe.ingredients?.flatMap((list) =>
			list.ingredientsList?.map((i) => i.text),
		),
		instructions: scaledRecipe.instructions
			?.map((i) => i.description)
			.map(normaliseInstruction),
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
