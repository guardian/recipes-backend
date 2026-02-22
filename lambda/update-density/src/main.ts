import { GetObjectCommand } from '@aws-sdk/client-s3';
import type { DensityJson } from '@recipes-api/lib/feast-models';
import {
	activateDensityData,
	listDensityDataRevisions,
	parseDensityCSV,
	publishDensityData,
	rollBackDensityData,
	s3Client,
	transformDensityData,
} from './density';
import type {
	ContentDescription,
	LambdaResponse,
	ListResponse,
	RollbackDensityRequest,
	UpdateDensityRequest,
} from './parameters';
import { UpdateRequest } from './parameters';

async function loadDensityJson(c: ContentDescription): Promise<DensityJson> {
	if (c.type == 's3') {
		const response = await s3Client.send(
			new GetObjectCommand({ Bucket: c.bucket, Key: c.path }),
		);
		if (response.Body) {
			const content = await response.Body.transformToString('utf-8');
			const entries = parseDensityCSV(content);
			return transformDensityData(entries);
		} else {
			throw new Error(`No content returned for s3://${c.bucket}/${c.path}`);
		}
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- it's not necessasry but clearer like this
	} else if (c.type == 'inline') {
		const entries = parseDensityCSV(c.content);
		return transformDensityData(entries);
	} else {
		//This should not happen - Zod enforces that c.type is either `inline` or `s3`.  I kept the structure, though,
		//to make it clearer what is going on
		throw new Error(`Unrecognised content type`);
	}
}
async function handleUpdate(request: UpdateDensityRequest) {
	const data = await loadDensityJson(request.csvContent);

	await publishDensityData(data);
	await activateDensityData(data);
}

async function handleRollback(request: RollbackDensityRequest) {
	return rollBackDensityData(request.toDate);
}

async function handleList(): Promise<ListResponse> {
	let token: string | undefined = undefined;
	let revisions: Date[] = [];
	let current: Date | undefined = undefined;
	do {
		const response = await listDensityDataRevisions(undefined, token);
		revisions = [...revisions, ...response.options];
		current = response.current;
		token = response.continuation;
	} while (token);

	return {
		status: 'ok',
		current: current ?? null,
		revisions,
	};
}

export const handler = async (event: unknown): Promise<LambdaResponse> => {
	const request = UpdateRequest.parse(event);

	try {
		switch (request.mode) {
			case 'update':
				await handleUpdate(request);
				return { status: 'ok', detail: 'published new current density data' };
			case 'list':
				return handleList();
			case 'rollback':
				await handleRollback(request);
				return { status: 'ok', detail: 'rolled back published density data' };
		}
	} catch (err) {
		console.error(`Error handling request ${JSON.stringify(event)}`);
		console.error(err);

		return {
			status: 'error',
			detail: err instanceof Error ? err.message : String(err),
		};
	}
};
