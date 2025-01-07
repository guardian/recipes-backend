import {
	createGetMandatoryNumberParameter,
	createGetMandatoryParameter,
} from 'lib/recipes-data/src/lib/parameters';

export const getRecipeIndexSnapshotBucket = createGetMandatoryParameter(
	'RECIPE_INDEX_SNAPSHOT_BUCKET',
);

export const getReindexBatchSize =
	createGetMandatoryNumberParameter('REINDEX_BATCH_SIZE');
