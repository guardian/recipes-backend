import { z } from 'zod';

export const IncomingDataRow = z.object({
	identityId: z.string(),
	top_accessed_recipes: z.array(
		z.string().regex(/^([A-Fa-f0-9]+)|(gu-recipe-[A-Fa-f0-9-]+)$/),
	),
});

export type IncomingDataRow = z.infer<typeof IncomingDataRow>;

//TBD, need to get the right format for these
export const InvokeEvent = z.object({
	gcs_blob: z.string(),
	identityId: z.string(),
});
