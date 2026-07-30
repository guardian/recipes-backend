import type { Express } from 'express';
import request from 'supertest';
import { multipleRecipesByUid } from '@recipes-api/lib/recipes-data';

jest.mock('./config');
jest.mock('./curation');
jest.mock('./check-template');
jest.mock('@recipes-api/lib/recipes-data');
jest.mock('@guardian/feast-multiplatform-library', () => ({
	com: {
		gu: {
			recipe: {
				js: {
					scaleRecipe: jest.fn(),
				},
			},
		},
	},
}));

describe('CORS middleware', () => {
	describe('with multiple allowed origins configured', () => {
		let expressApp: Express;

		beforeAll(() => {
			process.env['CORS_ALLOWED_ORIGINS'] =
				'https://www.theguardian.com,https://r.thegulocal.com';
			jest.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-require-imports -- need require() to load a fresh module instance after jest.resetModules()
			({ app: expressApp } = require('./app') as { app: Express });
		});

		afterAll(() => {
			delete process.env['CORS_ALLOWED_ORIGINS'];
			jest.resetModules();
		});

		it('returns CORS header for first allowed origin', async () => {
			const response = await request(expressApp)
				.get('/api/content/by-uid')
				.set('Origin', 'https://www.theguardian.com');
			expect(response.headers['access-control-allow-origin']).toBe(
				'https://www.theguardian.com',
			);
		});

		it('returns CORS header for second allowed origin', async () => {
			const response = await request(expressApp)
				.get('/api/content/by-uid')
				.set('Origin', 'https://r.thegulocal.com');
			expect(response.headers['access-control-allow-origin']).toBe(
				'https://r.thegulocal.com',
			);
		});

		it('does not return CORS header for disallowed origin', async () => {
			const response = await request(expressApp)
				.get('/api/content/by-uid')
				.set('Origin', 'https://evil.com');
			expect(response.headers['access-control-allow-origin']).toBeUndefined();
		});

		it('handles OPTIONS preflight for an allowed origin', async () => {
			const response = await request(expressApp)
				.options('/api/content/by-uid')
				.set('Origin', 'https://www.theguardian.com')
				.set('Access-Control-Request-Method', 'GET');
			expect(response.headers['access-control-allow-origin']).toBe(
				'https://www.theguardian.com',
			);
		});
	});
});

describe('GET /saved-from-web', () => {
	let expressApp: Express;

	beforeAll(() => {
		process.env['CORS_ALLOWED_ORIGINS'] =
			'https://www.theguardian.com,https://m.code.dev-theguardian.com';
		jest.resetModules();
		// eslint-disable-next-line @typescript-eslint/no-require-imports -- need require() to load a fresh module instance after jest.resetModules()
		({ app: expressApp } = require('./app') as { app: Express });
	});

	afterAll(() => {
		delete process.env['CORS_ALLOWED_ORIGINS'];
		jest.resetModules();
	});

	it('returns 400 when ids param is missing', async () => {
		const response = await request(expressApp).get('/saved-from-web');
		expect(response.status).toBe(400);
		expect(response.body).toMatchObject({ status: 'error' });
	});

	it('returns recipe index entries for valid ids', async () => {
		const mockEntry = {
			checksum: '6b2d5d097ec3481eaf8aa48c08d0fc22',
			recipeUID: 'uid-1',
			capiArticleId: 'food/article-1',
			sponsorshipCount: 0,
			version: 3,
		};
		(multipleRecipesByUid as jest.Mock).mockResolvedValueOnce([mockEntry]);

		const response = await request(expressApp).get(
			'/saved-from-web?ids=uid-1',
		);

		expect(response.status).toBe(200);
		expect(response.body).toMatchObject({
			status: 'ok',
			resolved: 1,
			requested: 1,
			results: [mockEntry],
		});
	});

	it('returns CORS header for allowed origin on /saved-from-web', async () => {
		(multipleRecipesByUid as jest.Mock).mockResolvedValueOnce([]);

		const response = await request(expressApp)
			.get('/saved-from-web?ids=uid-1')
			.set('Origin', 'https://www.theguardian.com');

		expect(response.headers['access-control-allow-origin']).toBe(
			'https://www.theguardian.com',
		);
	});

	it('handles OPTIONS preflight for /saved-from-web', async () => {
		const response = await request(expressApp)
			.options('/saved-from-web')
			.set('Origin', 'https://m.code.dev-theguardian.com')
			.set('Access-Control-Request-Method', 'GET');

		expect(response.status).toBe(204);
		expect(response.headers['access-control-allow-origin']).toBe(
			'https://m.code.dev-theguardian.com',
		);
	});
});
