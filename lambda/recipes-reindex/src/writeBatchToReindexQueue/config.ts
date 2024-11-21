import { mandatoryParameter } from 'lib/recipes-data/src/lib/parameters';
import { RecipeIndexSnapshotBucket } from '../sharedConfig';

export const getConfig = () => ({
	RecipeIndexSnapshotBucket,
	ReindexBatchSize: parseInt(mandatoryParameter('REINDEX_BATCH_SIZE')),
});
