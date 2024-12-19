import type { EventBridgeEvent } from 'aws-lambda';

export interface CrierEventDetail {
	'capi-models'?: string;
	channels?: string[];
	event: string; //Base64-encoded Thrift event
}

export type CrierEventBridgeEvent = EventBridgeEvent<
	'content-update' | 'content-delete',
	CrierEventDetail
>;

export interface ReindexEventDetail {
	articleId: string;
}

export type ReindexEventBridgeEvent = EventBridgeEvent<
	'recipes-reindex',
	ReindexEventDetail
>;
