import { z } from 'zod';

//Hmm, we don't actually have a full recipe model definition in here at the moment, just a set of partial ones
//this should probably be dealt with at some point
export const PartialRecipeModel = z.object({
	description: z.string(),
	ingredients: z.array(
		z.object({
			ingredientsList: z.array(
				z.object({
					text: z.string(),
				}),
			),
		}),
	),
	instructions: z.array(
		z.object({
			description: z.string(),
		}),
	),
	title: z.string(),
});
