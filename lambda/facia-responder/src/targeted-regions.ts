import type * as facia from '@recipes-api/lib/facia';

/**
 * This function takes in a full curation deployment from Facia tool and synthesises
 * regionalised versions, if present
 * @param src
 */
export function generateTargetedRegionFronts(
	src: facia.FeastCuration,
): facia.FeastCuration[] {
	const region = src.path ?? src.edition;

	if (region === 'northern') {
		//regionalise the northern front
		//TODO: bring through the fields to filter. For now, just duplicate
		const usOnly = {
			...src,
			path: 'us',
			edition: 'us',
		};
		return [src, usOnly];
	} else {
		//don't regionalise others
		return [src];
	}
}
