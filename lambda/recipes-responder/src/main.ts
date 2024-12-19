import { EventType } from '@guardian/content-api-models/crier/event/v1/eventType';
import { ItemType } from '@guardian/content-api-models/crier/event/v1/itemType';
import type { EventBridgeHandler } from 'aws-lambda';
import { registerMetric } from '@recipes-api/cwmetrics';
import { deserializeEvent } from '@recipes-api/lib/capi';
import {
	INDEX_JSON,
	retrieveIndexData,
	V2_INDEX_JSON,
	writeIndexData,
} from '@recipes-api/lib/recipes-data';
import {
	getContentPrefix,
	getFastlyApiKey,
	getStaticBucketName,
} from 'lib/recipes-data/src/lib/config';
import type { CrierEvent } from './eventbridge_models';
import { handleDeletedContent, handleTakedown } from './takedown_processor';
import { handleContentUpdate } from './update_processor';
import { handleContentUpdateRetrievable } from './update_retrievable_processor';

const filterProductionMonitoring: boolean = process.env[
	'FILTER_PRODUCTION_MONITORING'
]
	? process.env['FILTER_PRODUCTION_MONITORING'].toLowerCase() == 'yes'
	: false;

export async function processRecord({
	eventDetail,
	staticBucketName,
	fastlyApiKey,
	contentPrefix,
}: {
	eventDetail: CrierEvent;
	staticBucketName: string;
	fastlyApiKey: string;
	contentPrefix: string;
}): Promise<number> {
	if (eventDetail.channels && !eventDetail.channels.includes('feast')) {
		console.error(
			`Received a CrierEvent for channels ${eventDetail.channels.join()}, which did not include Feast! This is a configuration bug :(`,
		);
		return 0;
	}

	try {
		const evt = deserializeEvent(eventDetail.event);

		//we're only interested in content updates
		if (evt.itemType != ItemType.CONTENT) return 0;

		console.log(
			`DEBUG Received event of type ${evt.eventType} for item of type ${evt.itemType}`,
		);
		switch (evt.eventType) {
			case EventType.DELETE:
				if (
					filterProductionMonitoring &&
					evt.payloadId.startsWith('production-monitoring')
				) {
					return 0;
				}
				return handleTakedown({
					event: evt,
					staticBucketName,
					fastlyApiKey,
					contentPrefix,
				});
			case EventType.UPDATE:
			case EventType.RETRIEVABLEUPDATE:
				switch (evt.payload?.kind) {
					case undefined:
						console.log('DEBUG Event had no payload');
						break;
					case 'content':
						return handleContentUpdate({
							content: evt.payload.content,
							staticBucketName,
							fastlyApiKey,
							contentPrefix,
						});
					case 'retrievableContent':
						return handleContentUpdateRetrievable({
							retrievable: evt.payload.retrievableContent,
							staticBucketName,
							fastlyApiKey,
							contentPrefix,
						});
					case 'deletedContent':
						return handleDeletedContent(evt.payload.deletedContent);
					default:
						break;
				}
				break;
			default:
				console.error('ERROR Unknown event type ', evt.eventType);
		}
		return 0; //if we get here, no action was taken
	} catch (err) {
		console.error(
			`ERROR Could not process data from Kinesis: ${(err as Error).toString()}`,
		);
		return 0;
	}
}

export const handler: EventBridgeHandler<string, CrierEvent, void> = async (
	event,
) => {
	const contentPrefix = getContentPrefix();
	const staticBucketName = getStaticBucketName();
	const fastlyApiKey = getFastlyApiKey();

	const updatesTotal = await processRecord({
		eventDetail: event.detail,
		staticBucketName,
		fastlyApiKey,
		contentPrefix,
	});

	if (updatesTotal > 0) {
		console.log(
			`Processed updates for ${updatesTotal} recipes, rebuilding the index json`,
		);
		await registerMetric('UpdatesTotalOfArticle', updatesTotal);
		const indexDataForAllRecipes = await retrieveIndexData();
		const indexDataForUnSponsoredRecipes = {
			...indexDataForAllRecipes,
			recipes: indexDataForAllRecipes.recipes.filter(
				(r) => r.sponsorshipCount === 0,
			),
		};

		await writeIndexData({
			indexData: indexDataForUnSponsoredRecipes,
			Key: INDEX_JSON,
			contentPrefix,
			staticBucketName,
			fastlyApiKey,
		});
		await writeIndexData({
			indexData: indexDataForAllRecipes,
			Key: V2_INDEX_JSON,
			staticBucketName,
			contentPrefix,
			fastlyApiKey,
		});
		console.log('Finished rebuilding index');
	} else {
		console.log('No updates to recipes, so not touching index');
		await registerMetric('UpdatesTotalOfArticle', 0);
	}
};
