import { z } from 'zod';

//This should mirror FeastAppModel in Facia backend
export const RecipeIdentifier = z.object({
	id: z.string(),
});

export type RecipeIdentifier = z.infer<typeof RecipeIdentifier>;

export const Recipe = z.object({
	recipe: RecipeIdentifier,
});

export type Recipe = z.infer<typeof Recipe>;

export const ChefData = z.object({
	backgroundHex: z.string().optional(),
	id: z.string(),
	image: z.string().optional(),
	bio: z.string().optional(),
	foregroundHex: z.string().optional(),
});

export const Chef = z.object({
	chef: ChefData,
});

export type Chef = z.infer<typeof Chef>;

export const Palette = z.object({
	backgroundHex: z.string().optional(),
	foregroundHex: z.string().optional(),
});

export type Palette = z.infer<typeof Palette>;

export const SubCollectionData = z.object({
	byline: z.string().optional(),
	body: z.string().optional(),
	darkPalette: Palette.optional(),
	image: z.string().optional(),
	title: z.string(),
	lightPalette: Palette.optional(),
	recipes: z.array(z.string()),
});

export const SubCollection = z.object({
	collection: SubCollectionData,
});

export type SubCollection = z.infer<typeof SubCollection>;

export type ContainerItem = SubCollection | Chef | Recipe;
export const ContainerItemUnion = z.union([SubCollection, Chef, Recipe]);

export const FeastAppContainer = z.object({
	id: z.string().optional(),
	title: z.string(),
	body: z.string().optional(),
	items: z.array(ContainerItemUnion),
	targetedRegions: z.array(z.string()).optional(),
	excludedRegions: z.array(z.string()).optional(),
	containerHref: z.string().optional(),
});

export type FeastAppContainer = z.infer<typeof FeastAppContainer>;

const DateString = z.custom<string>((val) => {
	try {
		const d = Date.parse(val as string);
		return !isNaN(d);
	} catch {
		return false;
	}
});

export const FeastCurationEnvelope = z.object({
	id: z.string(),
	edition: z.string(),
	// The path to publish the issue under, e.g. 'northern', 'southern'.
	// If it is not present, we can fall back to the `edition`.
	path: z.string().optional(),
	issueDate: DateString,
	version: z.string(),
});

export type FeastCurationEnvelope = z.infer<typeof FeastCurationEnvelope>;

export const FeastCuration = z.intersection(
	FeastCurationEnvelope,
	z.object({
		fronts: z.record(z.string(), z.array(FeastAppContainer)),
	}),
);

export type FeastCuration = z.infer<typeof FeastCuration>;

export const FeastAppCurationPayload = z.array(FeastAppContainer);
export type FeastAppCurationPayload = z.infer<typeof FeastAppCurationPayload>;
