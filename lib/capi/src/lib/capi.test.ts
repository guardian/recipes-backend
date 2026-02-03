import { callCAPI, PollingAction } from './capi';
import { deserializeItemResponse } from './deserialize';

jest.mock('./deserialize', () => ({
	deserializeItemResponse: jest.fn(),
}));
describe('capi.callCAPI', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});
	const empty = new ArrayBuffer(0);
	const makeFetchResponse = (status: number, content: ArrayBuffer) =>
		Promise.resolve({
			arrayBuffer: () => Promise.resolve(content),
			status,
		} as Response);
	it('should return PollingActon.CONTENT_MISSING on 404', async () => {
		jest.spyOn(global, 'fetch').mockReturnValue(makeFetchResponse(404, empty));
		const result = await callCAPI('https://path-to-some-thing');
		expect(result.content).toBeUndefined();
		expect(result.action).toEqual(PollingAction.CONTENT_MISSING);
		//@ts-ignore - Typescript doesn't know that this is a mock
		expect(fetch.mock.calls[0][0]).toEqual('https://path-to-some-thing');
		//@ts-ignore - Typescript doesn't know that this is a mock
		expect(fetch.mock.calls.length).toEqual(1);
		//@ts-ignore - Typescript doesn't know that this is a mock
		expect(deserializeItemResponse.mock.calls.length).toEqual(0);
	});
	it('should return PollingActon.CONTENT_EXISTS with content on 200', async () => {
		jest.spyOn(global, 'fetch').mockReturnValue(makeFetchResponse(200, empty));
		//@ts-ignore - Typescript doesn't know that this is a mock
		deserializeItemResponse.mockReturnValue({
			content: { key: 'some-content-here' },
		});
		const result = await callCAPI('https://path-to-some-thing');
		expect(result.content).toEqual({ key: 'some-content-here' });
		expect(result.action).toEqual(PollingAction.CONTENT_EXISTS);
		//@ts-ignore - Typescript doesn't know that this is a mock
		expect(fetch.mock.calls[0][0]).toEqual('https://path-to-some-thing');
		//@ts-ignore - Typescript doesn't know that this is a mock
		expect(fetch.mock.calls.length).toEqual(1);
		//@ts-ignore - Typescript doesn't know that this is a mock
		expect(deserializeItemResponse.mock.calls.length).toEqual(1);
		//@ts-ignore - Typescript doesn't know that this is a mock
		expect(deserializeItemResponse.mock.calls[0][0]).toEqual(Buffer.from([]));
	});
	it('should return PollingActon.CONTENT_GONE on 410', async () => {
		jest.spyOn(global, 'fetch').mockReturnValue(makeFetchResponse(410, empty));
		const result = await callCAPI('https://path-to-some-thing');
		expect(result.content).toBeUndefined();
		expect(result.action).toEqual(PollingAction.CONTENT_GONE);
		//@ts-ignore - Typescript doesn't know that this is a mock
		expect(fetch.mock.calls[0][0]).toEqual('https://path-to-some-thing');
		//@ts-ignore - Typescript doesn't know that this is a mock
		expect(fetch.mock.calls.length).toEqual(1);
		//@ts-ignore - Typescript doesn't know that this is a mock
		expect(deserializeItemResponse.mock.calls.length).toEqual(0);
	});
	it('should return PollingActon.RATE_LIMITED on 429', async () => {
		jest.spyOn(global, 'fetch').mockReturnValue(makeFetchResponse(429, empty));
		const result = await callCAPI('https://path-to-some-thing');
		expect(result.content).toBeUndefined();
		expect(result.action).toEqual(PollingAction.RATE_LIMITED);
		//@ts-ignore - Typescript doesn't know that this is a mock
		expect(fetch.mock.calls[0][0]).toEqual('https://path-to-some-thing');
		//@ts-ignore - Typescript doesn't know that this is a mock
		expect(fetch.mock.calls.length).toEqual(1);
		//@ts-ignore - Typescript doesn't know that this is a mock
		expect(deserializeItemResponse.mock.calls.length).toEqual(0);
	});
});
