import { Readable } from 'stream';
import type { GetObjectCommandInput } from '@aws-sdk/client-s3';
import { S3Client, S3ServiceException } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import type { FeastAppContainer } from '@recipes-api/lib/facia';
import { generateHybridFront } from './curation';

const s3Mock = mockClient(S3Client);

// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- this is a mock, it's ok
jest.mock('@recipes-api/lib/recipes-data', () => ({
	...jest.requireActual('@recipes-api/lib/recipes-data'),
	getStaticBucketName: () => 'test',
}));

describe('generateHybridFront', () => {
	beforeEach(() => {
		s3Mock.reset();
	});

	const mockMainCurationData: FeastAppContainer[] = [
		{
			title: 'container 1',
			items: [{ recipe: { id: 'recipe-1a' } }, { recipe: { id: 'recipe-1b' } }],
		},
		{ title: 'container 2', items: [] },
		{
			title: 'container 3',
			items: [{ recipe: { id: 'recipe-3a' } }, { recipe: { id: 'recipe-3b' } }],
		},
		{
			title: 'container 4',
			items: [{ recipe: { id: 'recipe-4a' } }, { recipe: { id: 'recipe-4b' } }],
		},
	];

	const mockInsertCurationData: FeastAppContainer = {
		title: 'inserted container',
		items: [
			{ recipe: { id: 'recipe-5' } },
			{ recipe: { id: 'recipe-6' } },
			{ recipe: { id: 'recipe-7' } },
			{ recipe: { id: 'recipe-1b' } },
			{ recipe: { id: 'recipe-8' } },
			{ recipe: { id: 'recipe-9' } },
		],
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
				Bucket: 'test',
				Key: `northern/all-recipes/curation.json`,
			})
			.resolves({
				// @ts-ignore
				Body: mainCurationBody,
			});

		s3Mock
			.onAnyCommand({
				Bucket: 'test',
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
			undefined,
		);

		expect(result[0].title).toEqual('container 1');
		expect(result[1].title).toEqual('container 2');
		expect(result[2].title).toEqual('inserted container');
		expect(result[3].title).toEqual('container 3');
		expect(result[4].title).toEqual('container 4');
	});

	it('should safely handle the insertion point being beyond the end of the curated front', async () => {
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
				Bucket: 'test',
				Key: `northern/all-recipes/curation.json`,
			})
			.resolves({
				// @ts-ignore
				Body: mainCurationBody,
			});

		s3Mock
			.onAnyCommand({
				Bucket: 'test',
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
			100,
			new Date(2025, 0, 2),
			undefined,
		);

		expect(result[0].title).toEqual('container 1');
		expect(result[1].title).toEqual('container 2');
		expect(result[2].title).toEqual('container 3');
		expect(result[3].title).toEqual('container 4');
		expect(result[4].title).toEqual('inserted container');
	});

	it('should not perform insertion for meat-free (at present)', async () => {
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
				Bucket: 'test',
				Key: `northern/meat-free/curation.json`,
			})
			.resolves({
				// @ts-ignore
				Body: mainCurationBody,
			});

		s3Mock
			.onAnyCommand({
				Bucket: 'test',
				Key: `dynamic/curation/2025-01-02/FR.json`,
			})
			.resolves({
				//@ts-ignore
				Body: insertBody,
			});

		const result = await generateHybridFront(
			'northern',
			'meat-free',
			'fr',
			2,
			new Date(2025, 0, 2),
			undefined,
		);

		expect(result[0].title).toEqual('container 1');
		expect(result[1].title).toEqual('container 2');
		expect(result[2].title).toEqual('container 3');
		expect(result[3].title).toEqual('container 4');
	});

	it('should not put recipes in the insert that also exist in the curated content', async () => {
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
				Bucket: 'test',
				Key: `northern/all-recipes/curation.json`,
			})
			.resolves({
				// @ts-ignore
				Body: mainCurationBody,
			});

		s3Mock
			.onAnyCommand({
				Bucket: 'test',
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
			undefined,
		);

		expect(result[0].title).toEqual('container 1');
		expect(result[1].title).toEqual('container 2');
		expect(result[2].title).toEqual('inserted container');
		expect(result[2].items).toEqual([
			//i.e., it should not contain the duplicated `recipe-1b`
			{ recipe: { id: 'recipe-5' } },
			{ recipe: { id: 'recipe-6' } },
			{ recipe: { id: 'recipe-7' } },
			{ recipe: { id: 'recipe-8' } },
			{ recipe: { id: 'recipe-9' } },
		]);
		expect(result[3].title).toEqual('container 3');
		expect(result[4].title).toEqual('container 4');
	});

	it("should not crash if the insert data can't be loaded", async () => {
		const mainCurationBody = Readable.from(
			Buffer.from(JSON.stringify(mockMainCurationData)),
		);

		s3Mock.callsFake((input: GetObjectCommandInput) => {
			console.log(JSON.stringify(input));
		});

		s3Mock
			.onAnyCommand({
				Bucket: 'test',
				Key: `northern/meat-free/curation.json`,
			})
			.resolves({
				// @ts-ignore
				Body: mainCurationBody,
			});

		s3Mock
			.onAnyCommand({
				Bucket: 'test',
				Key: `dynamic/curation/2025-01-02/FR.json`,
			})
			.rejects(
				new S3ServiceException({
					name: 'blah',
					$fault: 'server',
					$metadata: {},
				}),
			);

		const result = await generateHybridFront(
			'northern',
			'meat-free',
			'fr',
			2,
			new Date(2025, 0, 2),
			undefined,
		);

		expect(result[0].title).toEqual('container 1');
		expect(result[1].title).toEqual('container 2');
		expect(result[2].title).toEqual('container 3');
		expect(result[3].title).toEqual('container 4');
	});

	it('should not crash if an exception occurs loading insert load', async () => {
		const mainCurationBody = Readable.from(
			Buffer.from(JSON.stringify(mockMainCurationData)),
		);

		s3Mock.callsFake((input: GetObjectCommandInput) => {
			console.log(JSON.stringify(input));
		});

		s3Mock
			.onAnyCommand({
				Bucket: 'test',
				Key: `northern/meat-free/curation.json`,
			})
			.resolves({
				// @ts-ignore
				Body: mainCurationBody,
			});

		s3Mock
			.onAnyCommand({
				Bucket: 'test',
				Key: `dynamic/curation/2025-01-02/FR.json`,
			})
			.rejects(new Error('my hovercraft is full of eels'));

		const result = await generateHybridFront(
			'northern',
			'meat-free',
			'fr',
			2,
			new Date(2025, 0, 2),
			undefined,
		);

		expect(result[0].title).toEqual('container 1');
		expect(result[1].title).toEqual('container 2');
		expect(result[2].title).toEqual('container 3');
		expect(result[3].title).toEqual('container 4');
	});

	it('should backtrack through recent dates if no curation can be found for the requested date', async () => {
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
				Bucket: 'test',
				Key: `northern/all-recipes/curation.json`,
			})
			.resolves({
				// @ts-ignore
				Body: mainCurationBody,
			});

		s3Mock
			.onAnyCommand({
				Bucket: 'test',
				Key: `dynamic/curation/2025-01-10/FR.json`,
			})
			.rejects(
				new S3ServiceException({
					name: 'NotFound',
					$fault: 'server',
					$metadata: {},
				}),
			)
			.onAnyCommand({
				Bucket: 'test',
				Key: `dynamic/curation/2025-01-05/FR.json`,
			})
			.rejects(
				new S3ServiceException({
					name: 'NotFound',
					$fault: 'server',
					$metadata: {},
				}),
			)
			.onAnyCommand({
				Bucket: 'test',
				Key: `dynamic/curation/2025-01-04/FR.json`,
			})
			.rejects(
				new S3ServiceException({
					name: 'NotFound',
					$fault: 'server',
					$metadata: {},
				}),
			)
			.onAnyCommand({
				Bucket: 'test',
				Key: `dynamic/curation/2025-01-03/FR.json`,
			})
			.rejects(
				new S3ServiceException({
					name: 'NotFound',
					$fault: 'server',
					$metadata: {},
				}),
			)
			.onAnyCommand({
				Bucket: 'test',
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
			new Date(2025, 0, 5),
			undefined,
		);

		expect(result[0].title).toEqual('container 1');
		expect(result[1].title).toEqual('container 2');
		expect(result[2].title).toEqual('inserted container');
		expect(result[3].title).toEqual('container 3');
		expect(result[4].title).toEqual('container 4');
	});
});
