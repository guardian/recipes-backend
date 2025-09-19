import {
	DeleteObjectCommand,
	NoSuchKey,
	PutObjectCommand,
	S3Client,
	S3ServiceException,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { MaximumRetries } from './config';
import { sendFastlyPurgeRequestWithRetries } from './fastly';
import {
	publishRecipeContent,
	removeRecipeContent,
} from './s3-recipe-repository';
import { awaitableDelay } from './utils';

const s3Mock = mockClient(S3Client);
const staticBucketName = 'contentbucket';
const fastlyApiKey = 'fastly-api-key';
const contentPrefix = 'cdn.content.location';

jest.mock('./config', () => ({
	MaximumRetries: 5,
}));

jest.mock('./utils', () => ({
	awaitableDelay: jest.fn(),
}));

jest.mock('./fastly', () => ({
	sendFastlyPurgeRequestWithRetries: jest.fn(),
	FastlyError: class FastlyError extends Error {},
}));

const recipeReference = {
	recipeUID: 'some-uid-here',
	sponsorshipCount: 0,
	recipeV2Blob: { jsonBlob: 'this-is-json', checksum: 'xxxyyyzzz' },
	recipeV3Blob: { jsonBlob: 'this-is-json', checksum: 'xxxyyyzzz' },
};

describe('s3.publishRecipeContent', () => {
	beforeEach(() => {
		s3Mock.reset();
		jest.resetAllMocks();
	});

	it('should upload the given content to S3 with correct headers', async () => {
		s3Mock.on(PutObjectCommand).resolves({});

		await publishRecipeContent({
			recipe: recipeReference,
			staticBucketName,
			fastlyApiKey,
			contentPrefix,
			shouldPublishV2: true,
		});

		expect(s3Mock.calls().length).toEqual(2);
		const uploadArgs = s3Mock.call(0).firstArg as PutObjectCommand;
		expect(uploadArgs.input.Body).toEqual('this-is-json');
		expect(uploadArgs.input.Key).toEqual(`content/xxxyyyzzz`);
		expect(uploadArgs.input.Bucket).toEqual('contentbucket');
		expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
		//@ts-ignore -- Typescript doesn't know that this is a mock
		expect(sendFastlyPurgeRequestWithRetries.mock.calls.length).toEqual(2);
		expect(
			//@ts-ignore -- Typescript doesn't know that this is a mock
			sendFastlyPurgeRequestWithRetries.mock.calls[0][0].contentPath,
		).toEqual('content/xxxyyyzzz');
		expect(
			//@ts-ignore -- Typescript doesn't know that this is a mock
			sendFastlyPurgeRequestWithRetries.mock.calls[0][0].apiKey,
		).toEqual(fastlyApiKey);
	});

	it('should retry any S3ServiceException up to MaximumRetries then throw the error', async () => {
		// @ts-ignore -- the S3ServiceException is malformed, but we are not reading the data anyway.
		s3Mock.on(PutObjectCommand).rejects(
			new S3ServiceException({
				$fault: 'client',
				$metadata: {},
				name: 'test',
			}),
		);

		// @ts-ignore -- typescript doesn't know that this is a mock
		awaitableDelay.mockReturnValue(Promise.resolve());

		await expect(
			publishRecipeContent({
				recipe: recipeReference,
				staticBucketName,
				fastlyApiKey,
				contentPrefix,
				shouldPublishV2: true,
			}),
		).rejects.toThrow(Error('Could not write to S3'));

		expect(s3Mock.calls().length).toEqual(MaximumRetries);
		expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
		// @ts-ignore - typescript doesn't know that this is a mock
		expect(awaitableDelay.mock.calls.length).toEqual(MaximumRetries - 1); //on the last send, we don't wait but throw immediately
		//@ts-ignore -- Typescript doesn't know that this is a mock
		expect(sendFastlyPurgeRequestWithRetries.mock.calls.length).toEqual(0); //nothing to purge if the upload failed
	});

	it("should immediately throw an error if it's not an S3ServiceException", async () => {
		s3Mock.on(PutObjectCommand).rejects(new Error('this is a test'));

		// @ts-ignore -- typescript doesn't know that this is a mock
		awaitableDelay.mockReturnValue(Promise.resolve());

		await expect(
			publishRecipeContent({
				recipe: recipeReference,
				staticBucketName,
				fastlyApiKey,
				contentPrefix,
				shouldPublishV2: true,
			}),
		).rejects.toThrow(Error);

		expect(s3Mock.calls().length).toEqual(1);
		expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
		// @ts-ignore - typescript doesn't know that this is a mock
		expect(awaitableDelay.mock.calls.length).toEqual(0);
	});
});

describe('s3.removeRecipeContent', () => {
	beforeEach(() => {
		s3Mock.reset();
		jest.resetAllMocks();
	});

	it('should delete the given content from S3 and purge the CDN cache', async () => {
		s3Mock.on(DeleteObjectCommand).resolves({});

		await removeRecipeContent({
			recipeSHA: 'xxxyyyzzz',
			staticBucketName,
			fastlyApiKey,
			contentPrefix,
		});

		expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(1);
		const deleteArgs = s3Mock.call(0).firstArg as DeleteObjectCommand;
		expect(deleteArgs.input.Bucket).toEqual('contentbucket');
		expect(deleteArgs.input.Key).toEqual('content/xxxyyyzzz');
		expect(s3Mock.commandCalls(PutObjectCommand).length).toEqual(0);

		//@ts-ignore -- Typescript doesn't know that this is a mock
		expect(sendFastlyPurgeRequestWithRetries.mock.calls.length).toEqual(1);
		expect(
			//@ts-ignore -- Typescript doesn't know that this is a mock
			sendFastlyPurgeRequestWithRetries.mock.calls[0][0].contentPath,
		).toEqual('content/xxxyyyzzz');
		expect(
			//@ts-ignore -- Typescript doesn't know that this is a mock
			sendFastlyPurgeRequestWithRetries.mock.calls[0][0].apiKey,
		).toEqual(fastlyApiKey);
		expect(
			//@ts-ignore -- Typescript doesn't know that this is a mock
			sendFastlyPurgeRequestWithRetries.mock.calls[0][0].purgeType,
		).toEqual('hard');
	});

	it('should retry a general S3ServiceException up to MaximumRetries then throw the error', async () => {
		// @ts-ignore -- the S3ServiceException is malformed, but we are not reading the data anyway.
		s3Mock.on(DeleteObjectCommand).rejects(
			new S3ServiceException({
				$fault: 'client',
				// @ts-ignore -- this value is not read anywhere in the test
				$metadata: {},
				name: 'test',
			}),
		);

		// @ts-ignore -- typescript doesn't know that this is a mock
		awaitableDelay.mockReturnValue(Promise.resolve());

		await expect(
			removeRecipeContent({
				recipeSHA: 'xxxyyyzzz',
				staticBucketName,
				fastlyApiKey,
				contentPrefix,
			}),
		).rejects.toThrow(Error('Could not delete from S3, see logs for details.'));

		expect(s3Mock.commandCalls(PutObjectCommand).length).toEqual(0);
		expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(
			MaximumRetries,
		);
		// @ts-ignore - typescript doesn't know that this is a mock
		expect(awaitableDelay.mock.calls.length).toEqual(MaximumRetries - 1); //on the last send, we don't wait but throw immediately
		//@ts-ignore -- Typescript doesn't know that this is a mock
		expect(sendFastlyPurgeRequestWithRetries.mock.calls.length).toEqual(0);
	});

	it('should return without error on a NoSuchKey exception', async () => {
		// @ts-ignore -- the exception is malformed but we don't need to worry about the contents
		s3Mock
			.on(DeleteObjectCommand)
			.rejects(new NoSuchKey({ $metadata: {}, message: 'This is a test' }));

		// @ts-ignore -- typescript doesn't know that this is a mock
		awaitableDelay.mockReturnValue(Promise.resolve());

		await removeRecipeContent({
			recipeSHA: 'xxxyyyzzz',
			staticBucketName,
			fastlyApiKey,
			contentPrefix,
		});

		expect(s3Mock.commandCalls(PutObjectCommand).length).toEqual(0);
		expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(1);
		// @ts-ignore - typescript doesn't know that this is a mock
		expect(awaitableDelay.mock.calls.length).toEqual(0);
	});

	it('should immediately break on a generalised exception', async () => {
		s3Mock.on(DeleteObjectCommand).rejects(new Error('this is a test'));

		// @ts-ignore -- typescript doesn't know that this is a mock
		awaitableDelay.mockReturnValue(Promise.resolve());

		await expect(
			removeRecipeContent({
				recipeSHA: 'xxxyyyzzz',
				staticBucketName,
				fastlyApiKey,
				contentPrefix,
			}),
		).rejects.toThrow(Error('this is a test'));

		expect(s3Mock.commandCalls(PutObjectCommand).length).toEqual(0);
		expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(1);
		// @ts-ignore - typescript doesn't know that this is a mock
		expect(awaitableDelay.mock.calls.length).toEqual(0);
	});
});
