import type { Express } from 'express';
import request from 'supertest';

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
