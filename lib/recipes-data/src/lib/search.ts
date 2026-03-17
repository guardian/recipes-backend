import { z } from 'zod';

export const SearchResultJson = z.object({
	title: z.string(),
	href: z.string().url(),
	uuid: z.string(),
	featuredImage: z.string().optional().nullable(),
	contributors: z.array(z.string()).optional().nullable(),
	byline: z.array(z.string()).optional().nullable(),
	dietIds: z.array(z.string()).optional().nullable(),
});
export type SearchResultJson = z.infer<typeof SearchResultJson>;

/**
 * Models the response from recipe-search-backend.  There are more fields present
 * than this, please update if you need access to them
 */
export const SearchResponseJson = z.object({
	results: z.array(SearchResultJson),
});
export type SearchResponseJson = z.infer<typeof SearchResponseJson>;
