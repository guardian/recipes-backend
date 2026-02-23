import { z } from 'zod';

export const IncomingDataRow = z.object({
	recipe_id: z.string().regex(/^([A-Fa-f0-9]+)|(gu-recipe-[A-Fa-f0-9-]+)$/),
	uniques: z.string().regex(/^\d+$/), //annoyingly BQ gives us this as a string :shrug:
});

export type IncomingDataRow = z.infer<typeof IncomingDataRow>;

//TBD, need to get the right format for these
// export const InvokeEvent = z.object({
// 	gcs_blob: z.string(),
// 	country_key: z.string(),
// });
export const InvokeEvent = z.object({
	country_key: z.string().optional(),
	gcs_blob: z.string().optional(),
	personalised: z.boolean().optional(), // Add this flag
});

export const IncomingPersonalisedRow = z.object({
	identity_id: z.string().regex(/^\d+$/),
	items: z.array(
		z.string().regex(/^([A-Fa-f0-9]+)|(gu-recipe-[A-Fa-f0-9-]+)$/),
	),
	total_available: z.number(),
});

export type IncomingPersonalisedRow = z.infer<typeof IncomingPersonalisedRow>;
