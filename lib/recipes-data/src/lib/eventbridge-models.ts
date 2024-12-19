export interface CrierEvent {
	'capi-models'?: string;
	channels?: string[];
	event: string; //Base64-encoded Thrift event
}

export interface ReindexEvent {
	articleIds: string[];
}
