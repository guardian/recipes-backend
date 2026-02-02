import * as fs from 'fs';
import { EventType } from '@guardian/content-api-models/crier/event/v1/eventType';
import { ItemType } from '@guardian/content-api-models/crier/event/v1/itemType';
import { deserializeEvent } from './deserialize';
describe('deserializeEvent', () => {
	it('should deserialize a test data blob', () => {
		const b64data = fs.readFileSync('failing-event.b64');
		const blob = atob(b64data.toString('latin1').trim());
		const result = deserializeEvent(blob);
		expect(result.payloadId).toEqual(
			'interactives/2021/08/covid-front-page-us/embed',
		);
		expect(result.eventType).toEqual(EventType.UPDATE);
		expect(result.itemType).toEqual(ItemType.ATOM);
		expect(result.payload?.kind).toEqual('atom');
	});
});
