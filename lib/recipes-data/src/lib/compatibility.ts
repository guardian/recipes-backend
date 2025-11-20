import type { RecipeV3 } from '@recipes-api/lib/feast-models';
import { RecipeV3Schema } from '@recipes-api/lib/feast-models';

/*
	eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
	-- disabling these rules as we have no other choice than to handle 'any' types here
*/
export function convertToRecipeV2(v3jsonBlob: string): string {
	const parsedJson = JSON.parse(v3jsonBlob);
	// check the format by parsing it, but we don't keep the result as it changes the orders of the fields
	RecipeV3Schema.parse(parsedJson);

	parsedJson['ingredients']?.forEach((ingredientGroup: any) => {
		ingredientGroup['ingredientsList']?.forEach((ingredient: any) => {
			delete ingredient['template'];
		});
	});

	parsedJson['instructions']?.forEach((instruction: any) => {
		delete instruction['descriptionTemplate'];
	});

	return JSON.stringify(parsedJson);
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
