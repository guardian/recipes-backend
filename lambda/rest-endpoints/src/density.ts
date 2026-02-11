import { parse } from 'csv-parse/sync';
import { DensityJson } from '@recipes-api/lib/feast-models';

class DensityEntry {
	id: number;
	name: string;
	normalised_name: string;
	density: number;
	source: string;

	constructor(row?: string[]) {
		if (!row) {
			this.id = 0;
			this.name = '';
			this.normalised_name = '';
			this.density = 0.0;
			this.source = '';
			return;
		}

		if (row.length < 4) {
			throw new Error('row did not have enough entries, expected at least 4');
		}

		if (row.length > 5) {
			console.warn(
				'got more rows than expected on input data, extras will be ignored',
			);
		}

		this.id = Number.parseInt(row[0], 10);
		this.name = row[1];
		this.normalised_name = row[2];
		this.density = Number.parseFloat(row[3]);
		this.source = '';
	}
}

export function parseDensityCSV(
	csvText: string,
	continueOnIncomplete = false,
) {
	const records: string[][] = parse(csvText, {
		relax_column_count: true,
		trim: true,
	});

	const entries = records.map((row, idx) => {
		try {
			return new DensityEntry(row);
		} catch (e) {
			if (idx === 0) {
				console.info(`Skipping possible header row ${JSON.stringify(row)}`);
				return;
			}
			console.warn(`Could not parse row ${idx}: ${(e as Error).message}`);
			return undefined;
		}
	});

	if (entries.length == 0) {
		throw new Error(`There was no data to import`);
	}
	const failureCount = entries.filter((e) => e == undefined).length;
	if (!continueOnIncomplete && failureCount > 0) {
		throw new Error(`${failureCount} rows did not convert`);
	}
	return entries.filter((e) => !!e) as DensityEntry[];
}

export function transformDensityData(entries: DensityEntry[]): DensityJson {
	return {
		prepared_at: new Date(),
		key: ['id', 'name', 'normalised_name', 'density'],
		values: entries.map((e) => [e.id, e.name, e.normalised_name, e.density]),
	};
}
