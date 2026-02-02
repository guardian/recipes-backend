import type { HeadObjectCommandInput } from '@aws-sdk/client-s3';
import {
	CopyObjectCommand,
	HeadObjectCommand,
	NotFound,
	S3Client,
	S3ServiceException,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { sendFastlyPurgeRequestWithRetries } from '@recipes-api/lib/recipes-data';
import { Today } from './config';
import {
	activateCuration,
	checkCurationPath,
	doesCurationPathMatch,
	generatePath,
	generatePathFromCuration,
	newCurationPath,
	validateAllCuration,
	validateCurationData,
} from './curation';
const s3Mock = mockClient(S3Client);
jest.mock('@recipes-api/lib/recipes-data', () => ({
	sendFastlyPurgeRequestWithRetries: jest.fn(),
}));
const contentPrefix = 'cdn.content.location';
const staticBucketName = 'static-bucket';
const fastlyApiKey = 'fastly-api-key';
jest.mock('./config', () => ({
	Today: new Date(2024, 1, 3, 8, 9, 10),
}));
describe('curation.checkCurationPath', () => {
	it('should extract data from a proper path', () => {
		const result = checkCurationPath(
			'northern-area/all-recipes/2020-01-02/curation.json',
		);
		expect(result?.edition).toEqual('northern-area');
		expect(result?.front).toEqual('all-recipes');
		expect(result?.year).toEqual(2020);
		expect(result?.month).toEqual(1);
		expect(result?.day).toEqual(2);
	});
	it('should return null for an unrecognised path', () => {
		const result = checkCurationPath('content/jkhdfsdsfFfiodfsds');
		expect(result).toBeNull();
	});
});
describe('curation.generatePathFromCuration', () => {
	it('should generate CurationPath from the provided data', () => {
		expect(
			generatePathFromCuration({
				edition: 'region-one',
				front: 'all-recipes',
				year: 2024,
				month: 3,
				day: 2,
			}),
		).toEqual('region-one/all-recipes/2024-03-02/curation.json');
	});
});
describe('curation.generatePath', () => {
	it('should generate the curation path for the given date', () => {
		expect(
			generatePath('region-one', 'all-recipes', new Date(2024, 2, 2)),
		).toEqual('region-one/all-recipes/2024-03-02/curation.json');
	});
});
describe('curation.doesCurationPathMatch', () => {
	it('should return truthy if the given date matches the CurationPath', () => {
		expect(
			doesCurationPathMatch(
				{ edition: '', front: '', year: 2024, month: 3, day: 2 },
				new Date(2024, 2, 2),
			),
		).toBeTruthy();
	});
	it('curation.should return falsy if the given date does not match the CurationPath', () => {
		expect(
			doesCurationPathMatch(
				{ edition: '', front: '', year: 2024, month: 3, day: 2 },
				new Date(2024, 1, 5),
			),
		);
	});
});
describe('curation.newCurationPath', () => {
	it('should return a CurationPath for the given data', () => {
		expect(
			newCurationPath('region-one', 'all-recipes', new Date(2024, 5, 6)),
		).toEqual({
			edition: 'region-one',
			front: 'all-recipes',
			year: 2024,
			month: 6,
			day: 6,
		});
	});
});
describe('curation.validateCurationData', () => {
	beforeEach(() => {
		s3Mock.reset();
	});
	it('should return a CurationPath object if the file exists', async () => {
		s3Mock.on(HeadObjectCommand).resolves({});
		const response = await validateCurationData(
			'some-region',
			'some-variant',
			new Date(2024, 2, 3),
			staticBucketName,
		);
		expect(s3Mock.commandCalls(HeadObjectCommand).length).toEqual(1);
		const c = s3Mock.commandCalls(HeadObjectCommand)[0];
		const arg = c.firstArg as HeadObjectCommand;
		expect(arg.input.Bucket).toEqual(staticBucketName);
		expect(arg.input.Key).toEqual(
			'some-region/some-variant/2024-03-03/curation.json',
		);
		expect(response?.front).toEqual('some-variant');
		expect(response?.edition).toEqual('some-region');
		expect(response?.year).toEqual(2024);
		expect(response?.month).toEqual(3);
		expect(response?.day).toEqual(3);
	});
	it('should return null if the file does not exist', async () => {
		s3Mock
			.on(HeadObjectCommand)
			.rejects(new NotFound({ $metadata: {}, message: '' }));
		const response = await validateCurationData(
			'some-region',
			'some-variant',
			new Date(2024, 2, 3),
			staticBucketName,
		);
		expect(response).toBeNull();
		expect(s3Mock.commandCalls(HeadObjectCommand).length).toEqual(1);
		const c = s3Mock.commandCalls(HeadObjectCommand)[0];
		const arg = c.firstArg as HeadObjectCommand;
		expect(arg.input.Bucket).toEqual(staticBucketName);
		expect(arg.input.Key).toEqual(
			'some-region/some-variant/2024-03-03/curation.json',
		);
	});
	it('should pass on any other error as an exception', async () => {
		s3Mock.on(HeadObjectCommand).rejects(
			new S3ServiceException({
				$fault: 'server',
				name: '',
				$metadata: {},
				message: 'Test exception',
			}),
		);
		await expect(
			validateCurationData(
				'some-region',
				'some-variant',
				new Date(2024, 2, 3),
				staticBucketName,
			),
		).rejects.toBeInstanceOf(S3ServiceException);
	});
});
describe('curation.validateAllCuration', () => {
	beforeEach(() => {
		s3Mock.reset();
		jest.resetAllMocks();
	});
	it('should return a list of the curation files which do exist', async () => {
		s3Mock
			.on(HeadObjectCommand)
			.resolvesOnce({})
			.rejectsOnce(new NotFound({ $metadata: {}, message: '' }))
			.resolvesOnce({})
			.rejects(new NotFound({ $metadata: {}, message: '' }));
		const result = await validateAllCuration(Today, false, staticBucketName);
		expect(s3Mock.commandCalls(HeadObjectCommand).length).toEqual(6);
		for (let i = 0; i < 6; i++) {
			const req = s3Mock.commandCalls(HeadObjectCommand)[i].firstArg
				.input as HeadObjectCommandInput;
			expect(req.Bucket).toEqual(staticBucketName);
			switch (i) {
				case 0:
					expect(req.Key).toEqual(
						'northern/meat-free/2024-02-03/curation.json',
					);
					break;
				case 1:
					expect(req.Key).toEqual(
						'northern/all-recipes/2024-02-03/curation.json',
					);
					break;
				case 2:
					expect(req.Key).toEqual(
						'southern/meat-free/2024-02-03/curation.json',
					);
					break;
				case 3:
					expect(req.Key).toEqual(
						'southern/all-recipes/2024-02-03/curation.json',
					);
					break;
				case 4:
					expect(req.Key).toEqual('us/meat-free/2024-02-03/curation.json');
					break;
				case 5:
					expect(req.Key).toEqual('us/all-recipes/2024-02-03/curation.json');
					break;
			}
		}
		expect(result.length).toEqual(2);
		expect(result[0]).toEqual({
			edition: 'northern',
			front: 'meat-free',
			year: 2024,
			month: 2,
			day: 3,
		});
		expect(result[1]).toEqual({
			edition: 'southern',
			front: 'meat-free',
			year: 2024,
			month: 2,
			day: 3,
		});
	});
});
describe('curation.activateCuration', () => {
	beforeEach(() => {
		s3Mock.reset();
	});
	it('should copy the given date to the default curation path', async () => {
		s3Mock
			.on(CopyObjectCommand)
			.resolves({ CopyObjectResult: { ETag: 'some-etag' } });
		await activateCuration(
			{
				edition: 'some-region',
				front: 'some-variant',
				year: 2023,
				month: 8,
				day: 9,
			},
			contentPrefix,
			staticBucketName,
			fastlyApiKey,
		);
		expect(s3Mock.commandCalls(CopyObjectCommand).length).toEqual(1);
		const input = (
			s3Mock.commandCalls(CopyObjectCommand)[0].firstArg as CopyObjectCommand
		).input;
		expect(input.Bucket).toEqual(staticBucketName);
		expect(input.CopySource).toEqual(
			`${staticBucketName}/some-region/some-variant/2023-08-09/curation.json`,
		);
		expect(input.Key).toEqual('some-region/some-variant/curation.json');
		const fastlyPurgeMocked = (sendFastlyPurgeRequestWithRetries as jest.Mock)
			.mock.calls;
		expect(fastlyPurgeMocked.length).toEqual(1);
	});
});
