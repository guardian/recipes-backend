import { mandatoryParameter } from 'lib/recipes-data/src/lib/parameters';
import { RecipeIndexSnapshotBucket } from '../sharedConfig';

export const getConfig = () => {
	return {
		RecipeIndexSnapshotBucket,
		ContentUrlBase: mandatoryParameter('CONTENT_URL_BASE'),
	};
};
