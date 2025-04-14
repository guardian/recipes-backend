import { getName as getCountryName } from 'i18n-iso-countries';
import { v4 as uuid } from 'uuid';
import type { FeastAppContainer } from '@recipes-api/lib/facia';
import type { IncomingDataRow } from './models';

function printableCountryName(isoCode: string): string {
	const countryName = getCountryName(isoCode, 'en');
	if (
		!!countryName &&
		(countryName.startsWith('United') ||
			countryName.startsWith('Seychelles') ||
			countryName.endsWith('Islands'))
	) {
		return 'in the ' + countryName;
	} else if (countryName) {
		return 'in ' + countryName;
	} else {
		console.warn(`Could not translate country code ${isoCode}`);
		return 'near you';
	}
}

/**
 * takes a set of rows from Bigquery and converts them into a Feast container
 * @param territory territory code
 * @param incoming incoming data
 * @return FeastAppContainer object
 */
export function convertBQReport(
	territory: string,
	incoming: IncomingDataRow[],
	sizeLimit = 10,
): FeastAppContainer {
	let items = incoming.map((r) => ({
		recipe: {
			id: r.recipe_id,
		},
	}));

	if (items.length > sizeLimit) items = items.slice(0, sizeLimit);

	const id = uuid();

	return {
		id,
		targetedRegions: [territory],
		title: `What's hot ${printableCountryName(territory)}`,
		items,
	};
}
