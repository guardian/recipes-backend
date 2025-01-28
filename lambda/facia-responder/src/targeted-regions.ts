import type * as facia from '@recipes-api/lib/facia';

/**
 * This function takes in a full curation deployment from Facia tool and synthesises
 * regionalised versions, if present
 * @param src
 */
export function generateTargetedRegionFronts(
	src: facia.FeastCuration,
): facia.FeastCuration[] {
	if (src.path === 'northern' || src.edition === 'feast-northern-hemisphere') {
		//regionalise the northern front
		//TODO: bring through the fields to filter. For now, just duplicate
		const usOnly = {
			...src,
			path: 'us',
			edition: 'feast-us-only',
		};
		return [src, usOnly];
	} else {
		//don't regionalise others
		return [src];
	}
}
