import { mandatoryParameter } from 'lib/recipes-data/src/lib/parameters';

export const recipeIndexSnapshotBucket = mandatoryParameter(
	'RECIPE_INDEX_SNAPSHOT_BUCKET',
);

export const reindexBatchSize = parseInt(
	mandatoryParameter('REINDEX_BATCH_SIZE'),
);

export const ContentUrlBase = mandatoryParameter('CONTENT_URL_BASE');
