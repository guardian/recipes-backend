import { v4 as uuid } from 'uuid';
import type { FeastAppContainer } from '@recipes-api/lib/facia';
import type { IncomingDataRow } from './models';

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
		title: `What's hot in ${territory}`, //FIXME: translate territory code
		items,
	};
}
