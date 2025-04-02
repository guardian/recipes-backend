import { z } from 'zod';

export const IncomingDataRow = z.object({
	recipe_id: z.string().regex(/^\w+$/),
	uniques: z.number(),
});

export type IncomingDataRow = z.infer<typeof IncomingDataRow>;

//TBD, need to get the right format for these
export const InvokeEvent = z.object({
	gcs_blob: z.string(),
	country_key: z.string(),
});
