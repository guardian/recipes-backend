import { z } from 'zod';

//TBD
export const IncomingDataRow = z.object({});
export type IncomingDataRow = z.infer<typeof IncomingDataRow>;

//TBD, need to get the right format for these
export const InvokeEvent = z.object({
	gcs_blob: z.string(),
	country_key: z.string(),
});
