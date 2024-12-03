import * as fs from 'node:fs';
import * as path from 'path';
import type { Chef, Recipe } from './facia-models';
import { FeastAppCurationPayload, FeastCuration } from './facia-models';

describe('facia-models', () => {
	function loadFixture(name: string) {
		const filepath = path.join(__dirname, name);

		const buffer = fs.readFileSync(filepath);
		return JSON.parse(buffer.toString('utf-8')) as unknown;
	}

	it('should be able to validate real data from Facia', () => {
		const rawContent = {
			id: 'D9AEEA41-F8DB-4FC8-A0DA-275571EA7331',
			edition: 'feast-northern-hemisphere',
			version: 'v1',
			issueDate: '2024-01-02',
			fronts: {
				'all-recipes': [
					{
						id: 'd353e2de-1a65-45de-85ca-d229bc1fafad',
						title: 'Dish of the day',
						body: '',
						items: [
							{
								recipe: {
									id: '14129325',
								},
							},
						],
					},
				],
				'meat-free': [
					{
						id: 'fa6ccb35-926b-4eff-b3a9-5d0ca88387ff',
						title: 'Dish of the day',
						body: '',
						items: [
							{
								recipe: {
									id: '14132263',
								},
							},
						],
					},
				],
			},
		};

		const typedData = FeastCuration.parse(rawContent);
		expect(typedData.fronts['all-recipes'].length).toEqual(1);

		expect(typedData.fronts['all-recipes'][0].body).toEqual('');
		expect(typedData.fronts['all-recipes'][0].id).toEqual(
			'd353e2de-1a65-45de-85ca-d229bc1fafad',
		);
		expect(typedData.fronts['all-recipes'][0].title).toEqual('Dish of the day');
		expect(typedData.fronts['all-recipes'][0].items.length).toEqual(1);
		const theRecipe = typedData.fronts['all-recipes'][0].items[0] as Recipe;
		expect(theRecipe.recipe.id).toEqual('14129325');
	});

	it('should be able to validate real data from MEP', () => {
		const data = loadFixture('real-curation-data.json');
		const typedData = FeastAppCurationPayload.parse(data);

		expect(typedData.length).toEqual(13);
		expect(typedData[11].title).toEqual('Meet our cooks');
		expect(typedData[11].items.length).toEqual(13);
		expect(typedData[11].items[0] as Chef).toEqual({
			chef: {
				backgroundHex: '#20809E',
				bio: 'Inspiration and global flavours for special occasions',
				foregroundHex: '#F9F9F5',
				id: 'profile/yotamottolenghi',
				image:
					'https://media.guim.co.uk/266825657a291ab9c1c0b798a0391f827b6c53ec/93_150_907_907/500.jpg',
			},
		});
		expect(typedData[0].title).toEqual('Dish of the day');
		expect(typedData[0].items.length).toEqual(1);
		expect(typedData[0].items[0] as Recipe).toEqual({
			recipe: {
				id: 'bc08f22818424e9489f47ab38a122179',
			},
		});
	});
});
