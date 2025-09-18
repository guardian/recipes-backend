import { RecipeV2Schema, RecipeV3Schema } from '@recipes-api/lib/feast-models';

/*
	eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
	-- disabling these rules as we have no other choice than to handle 'any' types here
*/
export function convertToRecipeV2(v3jsonBlob: string): string {
	const parsedJson = JSON.parse(v3jsonBlob);
	// check this is a valid recipe
	RecipeV3Schema.parse(parsedJson);

	delete parsedJson['ingredientsTemplate'];
	delete parsedJson['instructionsTemplate'];

	// check it conforms to v2 schema
	RecipeV2Schema.parse(parsedJson);
	return JSON.stringify(parsedJson);
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
