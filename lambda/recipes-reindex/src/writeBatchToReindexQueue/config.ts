import { mandatoryParameter } from 'lib/recipes-data/src/lib/parameters';

export const ReindexBatchSize = parseInt(
	mandatoryParameter('REINDEX_BATCH_SIZE'),
);
