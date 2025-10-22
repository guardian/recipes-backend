import { com } from '@guardian/feast-multiplatform-library';
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

		const result = checkTemplate(mockRecipeData);

		expect(result.match).toBe(false);
		expect(result.expected).toEqual({
			ingredients: ['200 g flour', '100 ml water'],
			instructions: ['Mix ingredients', 'Bake for 30 minutes'],
		});
		expect(result.received).toEqual({
			ingredients: ['200 g flour', '150 ml water'],
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

		const result = checkTemplate(mockRecipe);

		expect(result.match).toBe(true);
		expect(result.expected).toBeUndefined();
		expect(result.received).toBeUndefined();
	});

	it('should normalise apostrophes and match', () => {
		const mockRecipe: RecipeV3 = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [{ text: "2 tbsp chef's spice mix", name: 'spice' }],
				},
			],
			instructions: [{ description: "Let's cook!" }],
		} as RecipeV3;

		const mockScaledRecipe = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [{ text: '2 tbsp chef’s spice mix', name: 'spice' }],
				},
			],
			instructions: [{ description: 'Let’s cook!' }],
		};

		(com.gu.recipe.js.scaleRecipe as jest.Mock).mockReturnValue(
			JSON.stringify(mockScaledRecipe),
		);

		const result = checkTemplate(mockRecipe);

		expect(result.match).toBe(true);
		expect(result.expected).toBeUndefined();
		expect(result.received).toBeUndefined();
	});

	it('should normalise non-breaking spaces and match', () => {
		const mockRecipe: RecipeV3 = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [
						{ text: '100g\u00A0flour', name: 'flour' },
						{ text: '50ml\u00A0milk', name: 'milk' },
					],
				},
			],
			instructions: [{ description: 'Mix\u00A0well' }],
		} as RecipeV3;

		const mockScaledRecipe = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [
						{ text: '100g flour', name: 'flour' },
						{ text: '50ml milk', name: 'milk' },
					],
				},
			],
			instructions: [{ description: 'Mix well' }],
		};

		(com.gu.recipe.js.scaleRecipe as jest.Mock).mockReturnValue(
			JSON.stringify(mockScaledRecipe),
		);

		const result = checkTemplate(mockRecipe);

		expect(result.match).toBe(true);
		expect(result.expected).toBeUndefined();
		expect(result.received).toBeUndefined();
	});

	it('should normalise multiple spaces and match', () => {
		const mockRecipe: RecipeV3 = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [{ text: '100g  plain  flour', name: 'flour' }],
				},
			],
			instructions: [{ description: 'Mix  all  together' }],
		} as RecipeV3;

		const mockScaledRecipe = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [{ text: '100g plain flour', name: 'flour' }],
				},
			],
			instructions: [{ description: 'Mix all together' }],
		};

		(com.gu.recipe.js.scaleRecipe as jest.Mock).mockReturnValue(
			JSON.stringify(mockScaledRecipe),
		);

		const result = checkTemplate(mockRecipe);

		expect(result.match).toBe(true);
		expect(result.expected).toBeUndefined();
		expect(result.received).toBeUndefined();
	});

	it('should normalise units without spaces and match', () => {
		const mockRecipe: RecipeV3 = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [
						{ text: '200g flour', name: 'flour' },
						{ text: '150ml water', name: 'water' },
					],
				},
			],
			instructions: [{ description: 'Cook at 5cm depth' }],
		} as RecipeV3;

		const mockScaledRecipe = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [
						{ text: '200 g flour', name: 'flour' },
						{ text: '150 ml water', name: 'water' },
					],
				},
			],
			instructions: [{ description: 'Cook at 5 cm depth' }],
		};

		(com.gu.recipe.js.scaleRecipe as jest.Mock).mockReturnValue(
			JSON.stringify(mockScaledRecipe),
		);

		const result = checkTemplate(mockRecipe);

		expect(result.match).toBe(true);
		expect(result.expected).toBeUndefined();
		expect(result.received).toBeUndefined();
	});

	it('should normalise multiple unit types and match', () => {
		const mockRecipe: RecipeV3 = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [
						{ text: '1kg potatoes', name: 'potatoes' },
						{ text: '2cups rice', name: 'rice' },
					],
				},
			],
			instructions: [{ description: 'Add 3tbsp oil and 1tsp salt' }],
		} as RecipeV3;

		const mockScaledRecipe = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [
						{ text: '1 kg potatoes', name: 'potatoes' },
						{ text: '2 cups rice', name: 'rice' },
					],
				},
			],
			instructions: [{ description: 'Add 3 tbsp oil and 1 tsp salt' }],
		};

		(com.gu.recipe.js.scaleRecipe as jest.Mock).mockReturnValue(
			JSON.stringify(mockScaledRecipe),
		);

		const result = checkTemplate(mockRecipe);

		expect(result.match).toBe(true);
		expect(result.expected).toBeUndefined();
		expect(result.received).toBeUndefined();
	});

	it('should normalise combined differences and match', () => {
		const mockRecipe: RecipeV3 = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [
						{ text: "500g chef's\u00A0flour", name: 'flour' },
						{ text: '250ml  milk', name: 'milk' },
					],
				},
			],
			instructions: [
				{
					description:
						'Heat oven to 200C/400F/gas mark 6 and\u00A0cook for  45mins',
				},
			],
		} as RecipeV3;

		const mockScaledRecipe = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [
						{ text: '500 g chef’s flour', name: 'flour' },
						{ text: '250 ml milk', name: 'milk' },
					],
				},
			],
			instructions: [
				{ description: 'Heat oven to 200C/400F/gas 6 and cook for 45mins' },
			],
		};

		(com.gu.recipe.js.scaleRecipe as jest.Mock).mockReturnValue(
			JSON.stringify(mockScaledRecipe),
		);

		const result = checkTemplate(mockRecipe);

		expect(result.match).toBe(true);
		expect(result.expected).toBeUndefined();
		expect(result.received).toBeUndefined();
	});

	it('should normalise fractions with missing spaces and match', () => {
		const mockRecipe: RecipeV3 = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [
						{ text: '1½ tsp salt', name: 'salt' },
						{ text: '2¼ cups flour', name: 'flour' },
						{ text: '½ garlic clove', name: 'garlic' },
					],
				},
			],
			instructions: [{ description: 'Add 1¾ tbsp of oil' }],
		} as RecipeV3;

		const mockScaledRecipe = {
			...mockRecipeData,
			ingredients: [
				{
					ingredientsList: [
						{ text: '1 ½ tsp salt', name: 'salt' },
						{ text: '2 ¼ cups flour', name: 'flour' },
						{ text: '½ garlic clove', name: 'garlic' },
					],
				},
			],
			instructions: [{ description: 'Add 1 ¾ tbsp of oil' }],
		};

		(com.gu.recipe.js.scaleRecipe as jest.Mock).mockReturnValue(
			JSON.stringify(mockScaledRecipe),
		);

		const result = checkTemplate(mockRecipe);

		expect(result.match).toBe(true);
		expect(result.expected).toBeUndefined();
		expect(result.received).toBeUndefined();
	});
});
