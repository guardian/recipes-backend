import { com } from '@guardian/feast-multiplatform-library';
import { isEqual } from 'lodash-es';
import type { RecipeV3 } from '@recipes-api/lib/feast-models';
import { RecipeV2Schema } from '@recipes-api/lib/feast-models';
import scaleRecipe = com.gu.recipe.js.scaleRecipe;

function normaliseContainerSizes(
	match: string,
	num1: string,
	unit1: string,
	num2: string,
	unit2: string,
): string {
	const finalUnit = unit2 || unit1;
	if (finalUnit) {
		return `${num1} ${finalUnit} x ${num2} ${finalUnit}`;
	} else {
		return match;
	}
}

function normaliseFractions(
	match: string,
	whole: string,
	fraction: string,
): string {
	const fractionMap: Record<string, number> = {
		'¼': 0.25,
		'½': 0.5,
		'¾': 0.75,
		'⅛': 0.125,
	};
	try {
		const wholeInt = whole ? parseInt(whole, 10) : 0;
		const fractionValue = fractionMap[fraction];
		if (fractionValue) {
			const total = wholeInt + fractionValue;
			return total.toString();
		} else {
			return match;
		}
	} catch {
		return match;
	}
}

function normaliseInstructionOrIngredient(instruction: string): string {
	return instruction
		.replace(/\/gas mark/g, '/gas') // we render template as `250F/gas 4`, but some of our recipes have `250F/gas mark 4`
		.replace(/'/g, '’') // funnily enough, sonnet doesn't have a token for fancy apostrophe
		.replace(/[']/g, '’') // funnily enough, sonnet doesn't have a token for fancy apostrophe
		.replace(/[“”]/g, '"') // similarly, normalise double quotes as it confuses the model
		.replace(/\u00A0/g, ' ') // replace non-breaking spaces with regular spaces
		.replace(/(\d)? ?([\u00BC-\u00BE\u2150-\u215E])/g, normaliseFractions) // go from `1 ½` to `1.5`, so we compare consistently
		.replace(/ +/g, ' ') // replace any double space
		.replace(/(\d+)(kg|g|cup|cups|tbsp|tsp|ml|L|cm|mm)\b/gi, '$1 $2') // ensure there's a space between number and unit
		.replace(/\blitres\b/gi, 'l') // often written in plain text
		.replace(
			/(\d+)\s*(cm|mm|inch|inches)?\s*x\s*(\d+)\s*(cm|mm|inch|inches)?/gi,
			normaliseContainerSizes,
		)
		.trim();
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
