import { EventType } from '@guardian/content-api-models/crier/event/v1/eventType';
import { ItemType } from '@guardian/content-api-models/crier/event/v1/itemType';
import { ContentType } from '@guardian/content-api-models/v1/contentType';
import type { Handler } from 'aws-lambda';
import { registerMetric } from '@recipes-api/cwmetrics';
import { deserializeEvent } from '@recipes-api/lib/capi';
import {
	ContentDeleteEventDetail,
	ContentUpdateEventDetail,
	getShouldPublishV2,
	INDEX_JSON,
	ReindexEventDetail,
	retrieveIndexData,
	V2_INDEX_JSON,
	V3_INDEX_JSON,
	writeIndexData,
} from '@recipes-api/lib/recipes-data';
import type {
	CrierEventBridgeEvent,
	CrierEventDetail,
	ReindexEventBridgeEvent,
} from '@recipes-api/lib/recipes-data';
import {
	getCapiBaseUrl,
	getContentPrefix,
	getFastlyApiKey,
	getOutgoingEventBus,
	getStaticBucketName,
} from 'lib/recipes-data/src/lib/config';
import { handleDeletedContent, handleTakedown } from './takedown_processor';
import { handleContentUpdate } from './update_processor';
import { handleContentUpdateByCapiUrl as handleContentUpdateByCapiUrl } from './update_retrievable_processor';

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
	outgoingEventBus,
	shouldPublishV2,
}: {
	eventDetail: CrierEventDetail;
	staticBucketName: string;
	fastlyApiKey: string;
	contentPrefix: string;
	outgoingEventBus: string;
	shouldPublishV2: boolean;
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
					outgoingEventBus,
				});
			case EventType.UPDATE:
			case EventType.RETRIEVABLEUPDATE:
				switch (evt.payload?.kind) {
					case undefined: {
						console.log('DEBUG Event had no payload');
						break;
					}
					case 'content': {
						return handleContentUpdate({
							content: evt.payload.content,
							staticBucketName,
							fastlyApiKey,
							contentPrefix,
							outgoingEventBus,
							shouldPublishV2,
						});
					}
					case 'retrievableContent': {
						const { capiUrl, contentType, internalRevision } =
							evt.payload.retrievableContent;
						return handleContentUpdateByCapiUrl({
							capiUrl,
							contentType,
							internalRevision,
							staticBucketName,
							fastlyApiKey,
							contentPrefix,
							outgoingEventBus,
							shouldPublishV2,
						});
					}
					case 'deletedContent': {
						return handleDeletedContent(evt.payload.deletedContent);
					}
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

const processReindexEvent = async ({
	eventDetail,
	capiBaseUrl,
	staticBucketName,
	fastlyApiKey,
	contentPrefix,
	outgoingEventBus,
	shouldPublishV2,
}: {
	eventDetail: ReindexEventDetail;
	capiBaseUrl: string;
	staticBucketName: string;
	fastlyApiKey: string;
	contentPrefix: string;
	outgoingEventBus: string;
	shouldPublishV2: boolean;
}) => {
	let totalCount = 0;

	console.log(
		`Received ${
			eventDetail.articleIds.length
		} articles to reindex: \n${eventDetail.articleIds.join(', \n')}`,
	);

	for (const articleId of eventDetail.articleIds) {
		totalCount += await handleContentUpdateByCapiUrl({
			capiUrl: `${capiBaseUrl}/${articleId}`,
			contentType: ContentType.ARTICLE,
			staticBucketName,
			fastlyApiKey,
			contentPrefix,
			outgoingEventBus,
			shouldPublishV2,
		});
	}

	console.log(`Reindexed ${eventDetail.articleIds.length} articles`);

	return totalCount;
};

export const handler: Handler<
	CrierEventBridgeEvent | ReindexEventBridgeEvent,
	void
> = async (event) => {
	const contentPrefix = getContentPrefix();
	const staticBucketName = getStaticBucketName();
	const fastlyApiKey = getFastlyApiKey();
	const outgoingEventBus = getOutgoingEventBus();
	const capiBaseUrl = getCapiBaseUrl();
	const shouldPublishV2: boolean = getShouldPublishV2();

	const updatesTotal = await (async () => {
		switch (event['detail-type']) {
			case ContentUpdateEventDetail:
			case ContentDeleteEventDetail: {
				return await processRecord({
					eventDetail: event.detail,
					staticBucketName,
					fastlyApiKey,
					contentPrefix,
					outgoingEventBus,
					shouldPublishV2,
				});
			}
			case ReindexEventDetail: {
				return await processReindexEvent({
					eventDetail: event.detail,
					capiBaseUrl,
					staticBucketName,
					fastlyApiKey,
					contentPrefix,
					outgoingEventBus,
					shouldPublishV2,
				});
			}
			default: {
				console.error(`Unknown event payload: ${JSON.stringify(event)}`);
				return 0;
			}
		}
	})();

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
			key: INDEX_JSON,
			contentPrefix,
			staticBucketName,
			fastlyApiKey,
			filterOnVersion: 2,
		});
		await writeIndexData({
			indexData: indexDataForAllRecipes,
			key: V2_INDEX_JSON,
			staticBucketName,
			contentPrefix,
			fastlyApiKey,
			filterOnVersion: 2,
		});
		await writeIndexData({
			indexData: indexDataForAllRecipes,
			key: V3_INDEX_JSON,
			staticBucketName,
			contentPrefix,
			fastlyApiKey,
			filterOnVersion: 3,
		});
		console.log('Finished rebuilding index');
	} else {
		console.log('No updates to recipes, so not touching index');
		await registerMetric('UpdatesTotalOfArticle', 0);
	}
};
