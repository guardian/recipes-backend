import { Readable } from 'stream';
import type {
	GetObjectCommand,
	GetObjectCommandInput,
} from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import type { FeastAppContainer } from '@recipes-api/lib/facia';
import { generateHybridFront } from './curation';

const s3Mock = mockClient(S3Client);

describe('generateHybridFront', () => {
	beforeEach(() => {
		s3Mock.reset();
	});

	const mockMainCurationData: FeastAppContainer[] = [
		{ title: 'container 1', items: [] },
		{ title: 'container 2', items: [] },
		{ title: 'container 3', items: [] },
		{ title: 'container 4', items: [] },
	];

	const mockInsertCurationData: FeastAppContainer = {
		title: 'inserted container',
		items: [],
	};

	it('should retrieve both the curated front and inserts and combine them', async () => {
		const mainCurationBody = Readable.from(
			Buffer.from(JSON.stringify(mockMainCurationData)),
		);
		const insertBody = Readable.from(
			Buffer.from(JSON.stringify(mockInsertCurationData)),
		);

		s3Mock.callsFake((input: GetObjectCommandInput) => {
			console.log(JSON.stringify(input));
		});

		s3Mock
			.onAnyCommand({
				Bucket: undefined,
				Key: `northern/all-recipes/curation.json`,
			})
			.resolves({
				// @ts-ignore
				Body: mainCurationBody,
			});

		s3Mock
			.onAnyCommand({
				Bucket: undefined,
				Key: `dynamic/curation/2025-01-02/FR.json`,
			})
			.resolves({
				//@ts-ignore
				Body: insertBody,
			});

		const result = await generateHybridFront(
			'northern',
			'all-recipes',
			'fr',
			2,
			new Date(2025, 0, 2),
		);
		console.log(JSON.stringify(result));
		expect(result[0].title).toEqual('container 1');
		expect(result[1].title).toEqual('container 2');
		expect(result[2].title).toEqual('inserted container');
		expect(result[3].title).toEqual('container 3');
		expect(result[4].title).toEqual('container 4');
	});
});
