import { com } from '@guardian/feast-multiplatform-library';
import { isEqual } from 'lodash-es';
import type { RecipeV3 } from '@recipes-api/lib/feast-models';
import { checkTemplate } from './check-template';

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

jest.mock('lodash-es', () => ({
	isEqual: jest.fn(),
}));

const mockRecipeData = {
	id: 'f0d621db36a943769a203c85e3687169',
	canonicalArticle:
		'lifeandstyle/2018/may/13/ofm-classic-cookbook-sri-owen-the-rice-book-bee-wilson',
	composerId: '5ae9c469e4b06754a53019d9',
	webPublicationDate: null,
	title: 'Biryani with stuffed morels',
	description:
		'Choose large morels so that you can get more stuffing into each one.',
	serves: [
		{
			amount: {
				min: 2.0,
				max: 2.0,
			},
			unit: 'people',
			text: 'For 2 people as a one-dish meal',
		},
	],
	featuredImage: {
		url: 'https://i.guim.co.uk/img/media/28046d87c67fd2e36e018d8799d5119fac90c00e/498_391_4817_6018/master/4817.jpg?width=1600&dpr=1&s=none',
		mediaId: '28046d87c67fd2e36e018d8799d5119fac90c00e',
		cropId: '498_391_4817_6018',
		source: 'The Observer',
		photographer: 'Romas Foord',
		imageType: 'Photograph',
		caption:
			'Biryani with stuffed morels \nThe Rice Book by Sri Owen \nClassic cookbook \nProp and food styling: Polly Webb-Wilson \nObserver Food Monthly\nOFM',
		width: 1601,
		height: 2000,
	},
	timings: [],
	contributors: [],
	byline: ['Sri Owen'],
	celebrationIds: [],
	cuisineIds: ['indonesian'],
	mealTypeIds: ['dinner'],
	suitableForDietIds: ['meat-free', 'gluten-free', 'pescatarian', 'vegetarian'],
	utensilsAndApplianceIds: [],
	techniquesUsedIds: [],
	ingredients: [
		{
			ingredientsList: [
				{
					text: '200g flour',
					name: 'flour',
				},
				{
					text: '100ml water',
					name: 'water',
				},
			],
		},
	],
	instructions: [
		{ description: 'Mix ingredients' },
		{ description: 'Bake for 30 minutes' },
	],
};

describe('checkTemplate', () => {
	it('should return match: true when templates match', () => {
		(com.gu.recipe.js.scaleRecipe as jest.Mock).mockReturnValue(
			JSON.stringify(mockRecipeData),
		);

		(isEqual as jest.Mock).mockReturnValue(true);

		const result = checkTemplate(mockRecipeData);

		expect(result.match).toBe(true);
		expect(result.expected).toBeUndefined();
		expect(result.received).toBeUndefined();
	});

	it('should return match: false when templates do not match', () => {
		const mockScaledRecipe = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [
						{ text: '200g flour', name: 'flour' },
						{ text: '150ml water', name: 'water' },
					],
				},
			],
			instructions: [
				{ description: 'Mix ingredients' },
				{ description: 'Bake for 45 minutes' },
			],
		};

		(com.gu.recipe.js.scaleRecipe as jest.Mock).mockReturnValue(
			JSON.stringify(mockScaledRecipe),
		);

		(isEqual as jest.Mock).mockReturnValue(false);

		const result = checkTemplate(mockRecipeData);

		expect(result.match).toBe(false);
		expect(result.expected).toEqual({
			ingredients: ['200g flour', '100ml water'],
			instructions: ['Mix ingredients', 'Bake for 30 minutes'],
		});
		expect(result.received).toEqual({
			ingredients: ['200g flour', '150ml water'],
			instructions: ['Mix ingredients', 'Bake for 45 minutes'],
		});
	});

	it('should normalise oven temperature (gas mark) and match', () => {
		const mockRecipe: RecipeV3 = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [{ text: '1 chicken', name: 'chicken' }],
				},
			],
			instructions: [
				{ description: 'Preheat oven to 180C/250F/gas mark 4' },
				{ description: 'Cook for 1 hour' },
			],
		} as RecipeV3;

		const mockScaledRecipe = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [{ text: '1 chicken', name: 'chicken' }],
				},
			],
			instructions: [
				{ description: 'Preheat oven to 180C/250F/gas 4' },
				{ description: 'Cook for 1 hour' },
			],
		};

		(com.gu.recipe.js.scaleRecipe as jest.Mock).mockReturnValue(
			JSON.stringify(mockScaledRecipe),
		);

		(isEqual as jest.Mock).mockReturnValue(true);

		const result = checkTemplate(mockRecipe);

		expect(result.match).toBe(true);
		expect(result.expected).toBeUndefined();
		expect(result.received).toBeUndefined();
	});
});
