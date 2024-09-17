import type { PutObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { deployCurationData } from './curation';
import { sendFastlyPurgeRequestWithRetries } from './fastly';
import MockedFn = jest.MockedFn;

const s3Mock = mockClient(S3Client);

jest.mock('process', () => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- typescript doesn't like 'any' value
	const originalModule = jest.requireActual('process');

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- doesn't like 'any' value
	return {
		...originalModule,
		env: {
			CONTENT_URL_BASE: 'not-used',
			STATIC_BUCKET: 'static-content-bucket',
			AWS_REGION: 'some-aws-region',
			FASTLY_API_KEY: 'blahblahblah',
		},
	};
});

jest.mock('./fastly', () => ({
	sendFastlyPurgeRequestWithRetries: jest.fn(),
}));

describe('importNewData', () => {
	beforeEach(() => {
		s3Mock.reset();
		jest.resetAllMocks();
	});

	it('should upload the data to the right place and flush the CDN cache', async () => {
		await deployCurationData(
			'test-content',
			'some-region',
			'some-variant',
			null,
		);

		expect(s3Mock.calls().length).toEqual(1);
		const uploadArgs = s3Mock.call(0).firstArg as PutObjectCommand;
		expect(uploadArgs.input.Body).toEqual('test-content');
		expect(uploadArgs.input.Key).toEqual(
			`some-region/some-variant/curation.json`,
		);
		expect(uploadArgs.input.Bucket).toEqual('static-content-bucket');

		const fastlyPurgeMock = sendFastlyPurgeRequestWithRetries as MockedFn<
			typeof sendFastlyPurgeRequestWithRetries
		>;
		expect(fastlyPurgeMock.mock.calls[0][0]).toEqual(
			`some-region/some-variant/curation.json`,
		);
		expect(fastlyPurgeMock.mock.calls[0][1]).toEqual('blahblahblah');
		expect(fastlyPurgeMock.mock.calls[0][2]).toEqual('hard');
	});

	it('should respect the date parameter if given', async () => {
		const d = new Date(2021, 5, 5); //Note - actually 5th Jun - due to Date() constructor weirdness

		await deployCurationData('test-content', 'some-region', 'some-variant', d);

		expect(s3Mock.calls().length).toEqual(1);
		const uploadArgs = s3Mock.call(0).firstArg as PutObjectCommand;
		expect(uploadArgs.input.Body).toEqual('test-content');
		expect(uploadArgs.input.Key).toEqual(
			`some-region/some-variant/2021-06-05/curation.json`,
		);
		expect(uploadArgs.input.Bucket).toEqual('static-content-bucket');

		const fastlyPurgeMock = sendFastlyPurgeRequestWithRetries as MockedFn<
			typeof sendFastlyPurgeRequestWithRetries
		>;
		expect(fastlyPurgeMock.mock.calls[0][0]).toEqual(
			`some-region/some-variant/2021-06-05/curation.json`,
		);
		expect(fastlyPurgeMock.mock.calls[0][1]).toEqual('blahblahblah');
		expect(fastlyPurgeMock.mock.calls[0][2]).toEqual('hard');
	});
});
