import { FastlyError, sendFastlyPurgeRequest } from './fastly';

const contentPrefix = 'cdn.content.location';

describe('sendFastlyPurgeRequest', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('should POST to the Fastly API with the right URL and headers, using soft-purge at the default', async () => {
		const fakeData = JSON.stringify({ id: '1234xyz', status: 'ok' });

		jest.spyOn(global, 'fetch').mockReturnValue(
			Promise.resolve({
				text: () => Promise.resolve(fakeData),
				status: 200,
			} as Response),
		);
		await sendFastlyPurgeRequest({
			contentPath: '/path/to/content',
			apiKey: 'fake-key',
			contentPrefix,
		});

		//@ts-ignore
		expect(fetch.mock.calls.length).toEqual(1);
		//@ts-ignore
		expect(fetch.mock.calls[0][0]).toEqual(
			'https://api.fastly.com/purge/cdn.content.location/path/to/content',
		);
		//@ts-ignore
		expect(fetch.mock.calls[0][1]).toEqual({
			headers: {
				Accept: 'application/json',
				'FASTLY-KEY': 'fake-key',
				'Fastly-Soft-Purge': '1',
			},
			method: 'POST',
		});
	});

	it('should POST to the Fastly API with the right URL and headers, when hard-purge is requested', async () => {
		const fakeData = JSON.stringify({ id: '1234xyz', status: 'ok' });
		//@ts-ignore
		fetch.mockReturnValue(
			Promise.resolve({
				text: () => Promise.resolve(fakeData),
				status: 200,
			}),
		);
		await sendFastlyPurgeRequest({
			contentPath: '/path/to/content',
			apiKey: 'fake-key',
			contentPrefix,
			purgeType: 'hard',
		});

		//@ts-ignore
		expect(fetch.mock.calls.length).toEqual(1);
		//@ts-ignore
		expect(fetch.mock.calls[0][0]).toEqual(
			'https://api.fastly.com/purge/cdn.content.location/path/to/content',
		);
		//@ts-ignore
		expect(fetch.mock.calls[0][1]).toEqual({
			headers: {
				Accept: 'application/json',
				'FASTLY-KEY': 'fake-key',
			},
			method: 'POST',
		});
	});

	it('should throw a custom exception type if Fastly returns an error', async () => {
		const fakeData = JSON.stringify({ id: '>:-(', status: 'error' });
		//@ts-ignore
		fetch.mockReturnValue(
			Promise.resolve({
				text: () => Promise.resolve(fakeData),
				status: 502,
			}),
		);

		await expect(
			sendFastlyPurgeRequest({
				contentPath: '/path/to/content',
				apiKey: 'fake-key',
				contentPrefix,
			}),
		).rejects.toEqual(new FastlyError('Fastly returned 502'));

		//@ts-ignore
		expect(fetch.mock.calls.length).toEqual(1);
		//@ts-ignore
		expect(fetch.mock.calls[0][0]).toEqual(
			'https://api.fastly.com/purge/cdn.content.location/path/to/content',
		);
		//@ts-ignore
		expect(fetch.mock.calls[0][1]).toEqual({
			headers: {
				Accept: 'application/json',
				'FASTLY-KEY': 'fake-key',
				'Fastly-Soft-Purge': '1',
			},
			method: 'POST',
		});
	});
});
