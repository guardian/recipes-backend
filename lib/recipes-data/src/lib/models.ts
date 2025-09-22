import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import { formatISO } from 'date-fns';

interface Versions {
	v2: string;
	v3: string | null;
}

/**
 * RecipeDatabaseKey contains the fields necessary to uniquely identify a recipe in the index
 */
interface RecipeDatabaseKey {
	capiArticleId: string;
	recipeUID: string;
}

/**
 * RecipeIndexEntry represents a whole data record from the dynamo table containing the up-to-date index data.
 * Note that you may find it more efficient to only retrieve the fields you need rather than the whole thing.
 */
interface RecipeDatabaseEntry extends RecipeDatabaseKey {
	lastUpdated: Date;
	/** @deprecated use versions */
	recipeVersion: string;
	versions: Versions;
	sponsorshipCount: number;
}

/**
 * RecipeIndexEntry is a subset of the database model that is used to generate the client-facing index.
 */
export interface RecipeIndexEntry {
	checksum: string;
	recipeUID: string;
	capiArticleId: string;
	sponsorshipCount: number;
	version?: number;
}

export function recipeDatabaseEntryToIndexEntries(
	from: RecipeDatabaseEntry,
): RecipeIndexEntry[] {
	const entries: RecipeIndexEntry[] = [
		{
			checksum: from.versions.v2,
			recipeUID: from.recipeUID,
			capiArticleId: from.capiArticleId,
			sponsorshipCount: from.sponsorshipCount,
			version: 2,
		},
	];
	if (from.versions.v3) {
		entries.push({
			checksum: from.versions.v3,
			recipeUID: from.recipeUID,
			capiArticleId: from.capiArticleId,
			sponsorshipCount: from.sponsorshipCount,
			version: 3,
		});
	}
	return entries;
}

/**
 * RecipeIndex is the shape of the data that is sent out as the recipe index, containing an array of RecipeIndexEntry
 */
interface RecipeIndex {
	schemaVersion: number;
	lastUpdated: Date;
	recipes: RecipeIndexEntry[];
}

/**
 * RecipeReferenceWithoutChecksum is complementary to RecipeIndexEntry, where we have a UID and json blob but
 * no checksum yet. This is obtained from an incoming article.
 */
interface CAPIRecipeReference {
	recipeUID: string;
	jsonBlob: string;
	sponsorshipCount: number;
}

/**
 * RecipeBlob is a small structure containing the json content of a recipe and its checksum
 */
interface RecipeBlob {
	jsonBlob: string;
	checksum: string;
}

/**
 * RecipeReference has all three main constituents for a recipe - the immutable ID, the version ID and the json content
 */
interface RecipeReference {
	recipeUID: string;
	sponsorshipCount: number;
	recipeV2Blob: RecipeBlob;
	recipeV3Blob: RecipeBlob;
}

/**
 * RecipeDates is a subset of the RecipeReference structure, containing date fields that may be useful for sorting search results
 */
export interface RecipeDates {
	lastModifiedDate?: Date;
	firstPublishedDate?: Date;
	publishedDate?: Date;
}

export type Contributor =
	| { type: 'contributor'; tagId: string }
	| { type: 'freetext'; text: string };

export interface ChefData {
	webTitle: string;
	webUrl: string;
	apiUrl: string;
	bio?: string;
	bylineImageUrl?: string;
	bylineLargeImageUrl?: string;
}

export type ChefInfoFile = Record<string, ChefData>;

/**
 * Helper function to marshal a RecipeDatabaseEntry structure into a raw dynamo record.
 * @param ent - a RecipeDatabaseEntry
 * @return a record suitable for pushing to the Dynamo API
 */
export function recipeDatabaseEntryToDynamo(
	ent: RecipeDatabaseEntry,
): Record<string, AttributeValue> {
	let versions: Record<string, AttributeValue> = {
		versions: { M: { v2: { S: ent.versions.v2 } } },
	};
	if (ent.versions.v3) {
		versions = {
			versions: {
				M: { v2: { S: ent.versions.v2 }, v3: { S: ent.versions.v3 } },
			},
		};
	}
	return {
		capiArticleId: { S: ent.capiArticleId },
		recipeUID: { S: ent.recipeUID },
		lastUpdated: { S: formatISO(ent.lastUpdated) },
		recipeVersion: { S: ent.versions.v2 },
		...versions,
		sponsorshipCount: { N: ent.sponsorshipCount.toString() },
	};
}

/**
 * Helper function to convert a raw dynamo record into the RecipeIndexEntry subset.
 * Prefer to use this over the more complete RecipeDatabaseEntryFromDynamo if you don't
 * need to get the entire data model. Specifically, we ignore timestamps; so there is no
 * point spending time parsing and validating the timestamp if it's going to be dropped.
 * @param raw - a raw Dynamo record from the API
 * @return a RecipeIndexEntry subset record
 */
export function recipeIndexEntriesFromDynamo(
	raw: Record<string, AttributeValue>,
): RecipeIndexEntry[] {
	/* eslint-disable @typescript-eslint/no-unnecessary-condition -- on old records, `raw["sponsorshipCount"]` _can_ return `null` even though eslint thinks it can't. */
	type HashAndVersion = { h: string; v: number };
	const hashes: HashAndVersion[] = [
		{ h: raw['versions']?.M?.['v2']?.S ?? raw['recipeVersion']?.S, v: 2 },
		{ h: raw['versions']?.M?.['v3']?.S, v: 3 }, // h is potentially undefined here
	].filter(({ h }) => h) as HashAndVersion[]; // Removes entries with falsy hashes
	return hashes.map((h) => {
		return {
			checksum: h.h,
			recipeUID: raw['recipeUID'].S ?? '',
			capiArticleId: raw['capiArticleId'].S ?? '',
			sponsorshipCount: parseInt(raw['sponsorshipCount']?.N ?? '0'),
			version: h.v,
		};
	});
	/* eslint-enable @typescript-eslint/no-unnecessary-condition */
}

export type RecipeImage = {
	url: string;
	templateUrl?: string; // Contains #{width} so that device can request image at needed size
	mediaId?: string;
	cropId?: string;
	source?: string;
	photographer?: string;
	imageType?: string;
	caption?: string;
	mediaApiUri?: string;
	displayCredit?: boolean;
	width?: number;
	height?: number;
};

export type {
	RecipeDatabaseKey,
	RecipeDatabaseEntry,
	RecipeIndex,
	RecipeReference,
	CAPIRecipeReference,
};
