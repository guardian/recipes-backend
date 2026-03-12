import { z } from 'zod';

const RECIPE_ID_REGEX = /^([A-Fa-f0-9]+)|(gu-recipe-[A-Fa-f0-9-]+)$/;
export const IncomingDataRow = z.object({
	recipe_id: z.string().regex(RECIPE_ID_REGEX),
	uniques: z.string().regex(/^\d+$/), //annoyingly BQ gives us this as a string :shrug:
});

export type IncomingDataRow = z.infer<typeof IncomingDataRow>;

//TBD, need to get the right format for these
export const InvokeEventCountry = z.object({
	gcs_blob: z.string(),
	country_key: z.string(),
});

export const InvokeEventPersonalised = z.object({
	gcs_blob: z.string(),
	personalised: z.boolean(),
});

export const InvokeEvent = z.union([
	InvokeEventPersonalised,
	InvokeEventCountry,
]);

export const IncomingPersonalisedRow = z.object({
	identity_id: z.string().regex(/^\d+$/),
	items: z.array(
		z.object({
			id: z.string().regex(RECIPE_ID_REGEX),
		}),
	),
	total_available: z.coerce.number(),
});

export type IncomingPersonalisedRow = z.infer<typeof IncomingPersonalisedRow>;
