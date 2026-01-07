import type { IncomingHttpHeaders } from 'http';
import type { GetObjectOutput } from '@aws-sdk/client-s3';
import {
	GetObjectCommand,
	S3Client,
	S3ServiceException,
} from '@aws-sdk/client-s3';
import type { NodeJsRuntimeStreamingBlobTypes } from '@smithy/types/dist-types/streaming-payload/streaming-blob-common-types';
import { format as formatDate, subDays } from 'date-fns';
import type {
	ContainerItem,
	Recipe,
	SubCollection,
} from '@recipes-api/lib/facia';
import { FeastAppContainer } from '@recipes-api/lib/facia';
import {
	AwsRegion,
	consumeReadable,
	getStaticBucketName,
} from '@recipes-api/lib/recipes-data';

const s3Client = new S3Client({
	region: AwsRegion ?? 'eu-west-1',
});

async function rawCurationDataForToday(
	region: string,
	variant: string,
): Promise<GetObjectOutput> {
	try {
		return await s3Client.send(
			new GetObjectCommand({
				Bucket: getStaticBucketName(),
				Key: `${region}/${variant}/curation.json`,
			}),
		);
	} catch (err) {
		if (err instanceof S3ServiceException) {
			if (err.name == 'NotFound') {
				const today = formatDate(new Date(), 'yyyy-MM-dd');

				return await s3Client.send(
					new GetObjectCommand({
						Bucket: getStaticBucketName(),
						Key: `${region}/${variant}/${today}/curation.json`,
					}),
				);
			} else {
				console.error(`Unexpected S3 exception ${err.name}: `, err);
				throw err;
			}
		} else {
			console.error(`Unexpected exception `, err);
			throw err;
		}
	}
}

export async function retrieveTodaysCuration(
	region: string,
	variant: string,
): Promise<FeastAppContainer[]> {
	const s3response = await rawCurationDataForToday(region, variant);
	if (s3response.Body) {
		const rawData = await consumeReadable(
			s3response.Body as NodeJsRuntimeStreamingBlobTypes,
		);

		const rawJson = JSON.parse(rawData.toString()) as unknown;
		if (rawJson instanceof Array) {
			const data = (rawJson as unknown[]).map((d) =>
				FeastAppContainer.parse(d),
			);
			return data;
		} else {
			console.error(
				`Curation for ${region}/${variant} was not valid, no array at the root`,
			);
			throw new Error('Invalid curation data');
		}
	} else {
		console.error(
			`S3 object existed for ${region}/${variant} but no data recieved`,
		);
		throw new Error('No data received');
	}
}

/**
 * Gets the insert data (if any) for the given territory
 * @param territory two-letter territory code
 * @param date date to retrieve for
 * @returns the FeastAppContainer if present or `undefined` if not. Errors are raised through exceptions.
 */
export async function retrieveLocalisationInsert(
	territory: string,
	date: Date,
): Promise<FeastAppContainer | undefined> {
	const today = formatDate(date, 'yyyy-MM-dd');

	try {
		const s3response = await s3Client.send(
			new GetObjectCommand({
				Bucket: getStaticBucketName(),
				Key: `dynamic/curation/${today}/${territory.toUpperCase()}.json`,
			}),
		);
		const rawData = await consumeReadable(
			s3response.Body as NodeJsRuntimeStreamingBlobTypes,
		);
		const rawJson = JSON.parse(rawData.toString()) as unknown;
		return FeastAppContainer.parse(rawJson);
	} catch (err) {
		if (err instanceof S3ServiceException) {
			//S3 often hides 'NotFound' behind 'AccessDenied' exceptions, so we treat them the same
			if (err.name == 'NotFound' || err.name == 'AccessDenied') {
				console.info(
					`No localisation found for ${territory} on ${date.toISOString()}`,
				);
				return undefined;
			} else {
				throw err;
			}
		} else {
			throw err;
		}
	}
}

export async function findRecentLocalisation(
	territory: string,
	cutoffInDays: number,
	startDate: Date,
	curatedRecipes?: Set<string>,
	cutoff?: number,
) {
	for (let i = 0; i < cutoffInDays; i++) {
		const testDate = subDays(startDate, i);

		const maybeLocalisation = await retrieveLocalisationInsert(
			territory,
			testDate,
		);
		if (maybeLocalisation) {
			//if we have been given a set of curated recipes, ensure that they are not in the returned data
			if (curatedRecipes) {
				const deduplicatedLocalisation: FeastAppContainer = {
					...maybeLocalisation,
					//filter out anything that is a recipe specifier and also exists in curatedRecipes
					items: maybeLocalisation.items.filter(
						(row) =>
							// eslint-disable-next-line no-prototype-builtins -- how else to do this?
							(row.hasOwnProperty('recipe') &&
								!curatedRecipes.has((row as Recipe).recipe.id)) ||
							// eslint-disable-next-line no-prototype-builtins -- how else to do this?
							!row.hasOwnProperty('recipe'),
					),
				};
				return !!cutoff && deduplicatedLocalisation.items.length > cutoff
					? {
							...deduplicatedLocalisation,
							items: deduplicatedLocalisation.items.slice(0, cutoff),
						}
					: deduplicatedLocalisation;
			} else {
				//we have not been asked to de-duplicate
				return !!cutoff && maybeLocalisation.items.length > cutoff
					? {
							...maybeLocalisation,
							items: maybeLocalisation.items.slice(0, cutoff),
						}
					: maybeLocalisation;
			}
		}
	}
	return undefined;
}

function recipeFromContainer(item: ContainerItem): string[] {
	// eslint-disable-next-line no-prototype-builtins -- how else to do this?
	if (item.hasOwnProperty('recipe')) {
		const recipeItem = item as Recipe;
		return [recipeItem.recipe.id];
		// eslint-disable-next-line no-prototype-builtins -- how else to do this?
	} else if (item.hasOwnProperty('collection')) {
		const collectionItem = item as SubCollection;
		return collectionItem.collection.recipes;
	} else {
		return [];
	}
}

function getPersonalisedContainer(): FeastAppContainer {
	return {
		id: 'personalised-recently-viewed',
		title: 'Your recently viewed recipes',
		body: '',
		items: [],
		targetedRegions: [],
		excludedRegions: [],
		containerHref: 'persist/collection/personalised/recently-viewed',
	};
}

export async function generateHybridFront(
	region: string,
	variant: string,
	territory: string | undefined,
	localisationInsertionPoint: number,
	overrideDate?: Date,
): Promise<FeastAppContainer[]> {
	const curatedFront = await retrieveTodaysCuration(region, variant);
	if (variant == 'meat-free') {
		//we don't currently support localisation for meat-free
		return curatedFront;
	}

	const curatedRecipesSet = new Set(
		curatedFront.flatMap((c) => c.items).flatMap(recipeFromContainer),
	);

	if (!territory) {
		//no territory given so we can't localise
		return curatedFront;
	}
	const maybeLocalisation = await findRecentLocalisation(
		territory,
		5,
		overrideDate ?? new Date(),
		curatedRecipesSet,
		10,
	);

	const personalisedContainer = getPersonalisedContainer();
	if (!maybeLocalisation) {
		console.info(
			`No localisation available for ${region} / ${variant} in ${territory}`,
		);
	}
	const injectedContainers = maybeLocalisation
		? [maybeLocalisation, personalisedContainer] //Let's assume we always want personalised container after localisation container
		: [personalisedContainer];

	if (curatedFront.length < localisationInsertionPoint) {
		curatedFront.push(...injectedContainers);
		return curatedFront;
	} else {
		return curatedFront
			.slice(0, localisationInsertionPoint)
			.concat(
				injectedContainers,
				...curatedFront.slice(localisationInsertionPoint),
			);
	}
}
