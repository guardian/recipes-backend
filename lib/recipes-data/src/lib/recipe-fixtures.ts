import type { RecipeReference } from './models';
import type { Recipe } from './types';

export const exampleRecipe: Recipe = {
	bookCredit:
		'Laura Goodman is the author of The Joy of Snacks (Headline, £17) and Carbs (Quadrille, £15)',
	canonicalArticle:
		'food/2024/jan/29/hot-honey-and-ricotta-on-toast-recipe-by-laura-goodman',
	celebrationIds: [],
	composerId: '65a16d5d8f08db8899970af4',
	contributors: [],
	cuisineIds: ['british'],
	description:
		'Hot honey is hot property. The orange gives this hot honey life, which is just so typical of orange. Use it on this dreamboat of ricotta toast first, then keep the rest in an airtight container to drizzle over halloumi or roast chicken',
	previewImage: {
		url: 'https://media.guim.co.uk/87a7591d5260e962ad459d56771f50fc0ce05f14/360_1725_4754_4754/2000.jpg',
		mediaId: '87a7591d5260e962ad459d56771f50fc0ce05f14',
		cropId: '0_257_5626_6188',
		source: 'The Observer',
		photographer: 'Romas Foord',
		caption: 'Hot honey and ricotta on toast.',
		mediaApiUri: '',
		width: 2000,
		height: 2000,
		imageType: 'Photograph',
		displayCredit: true,
	},
	featuredImage: {
		url: 'https://media.guim.co.uk/87a7591d5260e962ad459d56771f50fc0ce05f14/360_1725_4754_4754/2000.jpg',
		mediaId: '87a7591d5260e962ad459d56771f50fc0ce05f14',
		cropId: '0_2412_5626_3375',
		source: 'The Observer',
		photographer: 'Romas Foord',
		caption: 'Hot honey and ricotta on toast.',
		mediaApiUri: '',
		width: 2000,
		height: 2000,
		imageType: 'Photograph',
		displayCredit: true,
	},
	id: 'e92079895225469b8f09efcc0fe8f455',
	ingredients: [
		{
			ingredientsList: [
				{
					amount: {
						max: 100,
						min: 100,
					},
					name: 'ricotta',
					optional: false,
					text: 'ricotta 100 g',
					unit: 'g',
				},
				{
					amount: {
						max: 2,
						min: 2,
					},
					name: 'milk',
					optional: false,
					suffix: '(any kind)',
					text: 'milk (any kind) 2 tbsp',
					unit: 'tbsp',
				},
				{
					amount: {
						min: null,
						max: null,
					},
					name: 'extra virgin olive oil',
					optional: false,
					text: 'extra virgin olive oil',
				},
				{
					amount: {
						min: 2,
						max: 2,
					},
					name: 'sourdough',
					optional: false,
					suffix: 'or pain de campagne (anything crusty and rustic), toasted',
					text: 'sourdough or pain de campagne (anything crusty and rustic) 2 slices, toasted',
					unit: 'slices',
				},
				{
					amount: {
						max: 20,
						min: 20,
					},
					name: 'salted pistachios',
					optional: false,
					suffix: 'roughly chopped',
					text: 'salted pistachios 20 g, roughly chopped',
					unit: 'g',
				},
				{
					name: 'flaky salt',
					optional: false,
					text: 'flaky salt',
				},
			],
			recipeSection: '',
		},
		{
			ingredientsList: [
				{
					amount: {
						max: 80,
						min: 80,
					},
					name: 'dark honey',
					optional: false,
					text: 'dark honey 80 g',
					unit: 'g',
				},
				{
					amount: {
						max: 1,
						min: 1,
					},
					name: 'aleppo chilli flakes',
					optional: false,
					text: 'aleppo chilli flakes 1 tsp',
					unit: 'tsp',
				},
				{
					amount: {
						max: 1,
						min: 1,
					},
					name: 'orange peel',
					optional: false,
					text: 'orange peel 1 strip',
					unit: 'strip',
				},
				{
					amount: {
						max: 1,
						min: 1,
					},
					name: 'ground cinnamon',
					optional: false,
					text: 'ground cinnamon a pinch',
					unit: 'pinch',
				},
				{
					amount: {
						max: 2,
						min: 2,
					},
					name: 'orange juice',
					optional: false,
					text: 'orange juice 2 tsp',
					unit: 'tsp',
				},
			],
			recipeSection: 'For the honey',
		},
	],
	instructions: [
		{
			description:
				'For the honey, heat the honey with the chilli flakes, strip of orange peel and pinch of cinnamon until very liquid and bubbling at the edges. Turn the heat off and leave it to cool for five minutes. Discard the orange peel and stir through the orange juice',
			stepNumber: 1,
		},
		{
			description:
				'To assemble the toast, first loosen the ricotta with the milk in a little bowl',
			stepNumber: 2,
		},
		{
			description:
				'Drizzle olive oil on the toasts, then spread the ricotta using the back of a spoon. Top each slice with chopped salted pistachios, plenty of honey and a pinch of flaky salt',
			stepNumber: 3,
		},
	],
	isAppReady: false,
	mealTypeIds: ['brunch', 'breakfast', 'snack'],
	serves: [
		{
			amount: {
				max: 2,
				min: 2,
			},
			text: 'Serves 2',
			unit: 'people',
		},
	],
	suitableForDietIds: ['vegetarian'],
	techniquesUsedIds: [],
	timings: [
		{
			durationInMins: {
				min: 15,
				max: 20,
			},
			qualifier: 'cook',
		},
	],
	title: 'Hot honey and ricotta on toast',
	utensilsAndApplianceIds: [],
	byline: ['Laura Goodman'],
};
