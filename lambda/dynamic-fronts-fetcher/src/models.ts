import { z } from 'zod';

//TBD
export const IncomingDataRow = z.object({});
export type IncomingDataRow = z.infer<typeof IncomingDataRow>;

//TBD, need to get the right format for these
export const InvokeEvent = z.object({
	gcpBucket: z.string(),
	filePath: z.string(),
});
