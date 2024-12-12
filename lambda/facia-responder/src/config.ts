import { createGetMandatoryParameter } from 'lib/recipes-data/src/lib/parameters';

export const getFaciaPublicationStatusTopicArn = createGetMandatoryParameter(
	'FACIA_PUBLISH_STATUS_TOPIC_ARN',
);

export const getFaciaPublicationStatusRoleArn = createGetMandatoryParameter(
	'FACIA_PUBLISH_STATUS_ROLE_ARN',
);
