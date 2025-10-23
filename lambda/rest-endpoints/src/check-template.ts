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
		.replace(/(\d)([\u00BC-\u00BE\u2150-\u215E])/g, '$1 $2') // ensure space between whole number and fraction (e.g., 1½ -> 1 ½)
		.replace(/ +/g, ' ') // replace any double space
		.replace(/(\d+)(kg|g|cup|cups|tbsp|tsp|ml|L|cm|mm)\b/gi, '$1 $2') // ensure there's a space between number and unit
		.replace(
			/(\d+)\s*(cm|mm|inch|inches)?\s*x\s*(\d+)\s*(cm|mm|inch|inches)?/gi,
			(
				match: string,
				num1: string,
				unit1: string,
				num2: string,
				unit2: string,
			) => {
				// normalize dimension formats: "30 x 20 cm" -> "30 cm x 20 cm"
				const finalUnit = unit2 || unit1;
				if (finalUnit) {
					return `${num1} ${finalUnit} x ${num2} ${finalUnit}`;
				} else {
					return match;
				}
			},
		);
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
