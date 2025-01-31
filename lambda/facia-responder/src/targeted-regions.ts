import type * as facia from '@recipes-api/lib/facia';
import type { FeastAppContainer } from '@recipes-api/lib/facia';

/**
 * Filters the incoming fronts list based on targetedRegions and excludedRegions
 * @param fronts fronts list to filter
 * @param filterFor territory we are filtering for
 * @param filterIn if `true`, filter IN for this territory (i.e., take global, take targeted, remove excluded)
 * if `false` filter OUT for this territory (i.e., take global, remove targeted, take excluded)
 */
function filterFrontsFor(
	fronts: Record<string, FeastAppContainer[]>,
	filterFor: string,
	filterIn: boolean,
): Record<string, FeastAppContainer[]> {
	const filtered: Record<string, FeastAppContainer[]> = {};

	const maybeInverted = (v: boolean) => (filterIn ? !v : v);

	for (const k of Object.keys(fronts)) {
		filtered[k] = fronts[k].filter((f) => {
			return (
				maybeInverted((f.excludedRegions ?? []).includes(filterFor)) ||
				((f.excludedRegions ?? []).length == 0 &&
					(f.targetedRegions ?? []).length == 0)
			);
		});
	}

	return filtered;
}

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
		const usOnlyFronts = filterFrontsFor(src.fronts, 'us', true);

		const usOnly = {
			...src,
			path: 'us',
			edition: 'feast-us-only',
			fronts: usOnlyFronts,
		};

		const otherFronts = filterFrontsFor(src.fronts, 'us', false);
		const restOfHemisphere = {
			...src,
			fronts: otherFronts,
		};

		return [restOfHemisphere, usOnly];
	} else {
		//don't regionalise others
		return [src];
	}
}
