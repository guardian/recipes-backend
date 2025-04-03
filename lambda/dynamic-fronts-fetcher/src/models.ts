import { z } from 'zod';

export const IncomingDataRow = z.object({
	recipe_id: z.string().regex(/^([A-Fa-f0-9]+)|(gu-recipe-[A-Fa-f0-9-]+)$/),
	uniques: z.string().regex(/^\d+$/), //annoyingly BQ gives us this as a string :shrug:
});

export type IncomingDataRow = z.infer<typeof IncomingDataRow>;

//TBD, need to get the right format for these
export const InvokeEvent = z.object({
	gcs_blob: z.string(),
	country_key: z.string(),
});
