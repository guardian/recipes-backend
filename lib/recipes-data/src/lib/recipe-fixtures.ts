import type { RecipeImage } from "./models";

export type RecipeFixture = Record<string, unknown> & {
	id: string;
	featuredImage: RecipeImage;
	previewImage?: RecipeImage;
};

export const recipes = [
	{
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
			cropId: '360_1725_4754_4754',
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
			cropId: '360_1725_4754_4754',
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
	},
	{
		bookCredit: '',
		canonicalArticle:
			'food/2024/mar/12/nigel-slaters-recipe-for-roast-fennel-blood-orange-and-almonds',
		celebrationIds: [],
		composerId: '65e5ce818f086762e6507c74',
		contributors: [
			{
				type: 'contributor',
				tagId: 'profile/nigelslater',
			},
		],
		cuisineIds: [],
		description:
			'This is a refreshing side dish to sit aside cold cuts. Ricotta cheese, lightly seasoned with olive oil and fennel seeds, can be spooned over the fennel as you serve. ',
		difficultyLevel: 'easy',
		featuredImage: {
			url: 'https://media.guim.co.uk/902a2c387ba62c49ad7553c2712eb650e73eb5b2/258_0_7328_4400/2000.jpg',
			mediaId: '902a2c387ba62c49ad7553c2712eb650e73eb5b2',
			cropId: '',
			source: 'The Observer',
			photographer: 'Jonathan Lovekin',
			imageType: 'Photograph',
			caption: 'Roast fennel, blood orange and almonds.',
			mediaApiUri: '',
			displayCredit: true,
			width: 2000,
			height: 1200,
		},
		id: 'dbf66a74bc9d4b3a917b6ab5dba12f86',
		ingredients: [
			{
				ingredientsList: [
					{
						amount: {
							min: 3,
							max: 3,
						},
						name: 'fennel',
						optional: false,
						prefix: 'of',
						unit: 'heads',
					},
					{
						amount: {
							min: 3,
							max: 3,
						},
						name: 'olive oil',
						optional: false,
						unit: 'good tbsp',
					},
					{
						amount: {
							min: 3,
							max: 3,
						},
						name: 'flaked almonds',
						optional: false,
						unit: 'tbsp',
					},
					{
						amount: {
							min: 3,
							max: 3,
						},
						name: 'blood oranges',
						optional: false,
					},
					{
						amount: {
							min: 100,
							max: 100,
						},
						name: 'sherry',
						optional: false,
						suffix: 'dry or medium',
					},
				],
				recipeSection: 'Section 1',
			},
			{
				ingredientsList: [
					{
						name: '',
						optional: false,
					},
				],
				recipeSection: 'Section 2',
			},
		],
		instructions: [
			{
				description: 'Preheat the oven to 200C/gas mark 6.',
			},
			{
				description:
					'Snap the feathery green fronds from the heads of fennel and set aside for later. Slice the fennel in half from stem to root, then cut each half into 3 or 4 segments. Put them into a roasting tin or baking dish, trickle over the olive oil then season lightly with salt. Bake for 30 minutes or so, turning them over once or twice so the cut edges colour to pale, toasted gold.',
			},
			{
				description:
					'Scatter the flaked almonds in a dry, shallow pan and place over a moderate heat. Let the almonds brown lightly, taking care not to let them darken beyond a pale gold, lest they turn bitter. Remove from the heat and set aside with the fennel fronds.',
			},
			{
				description:
					'Using a very sharp knife, slice the peel from 2 blood oranges, then cut the orange into thin slices and set aside, reserving any juice you can. Halve and squeeze a third small blood orange.',
			},
			{
				description:
					'Remove the roasting tin from the oven once the fennel is golden and pour in 100ml of dry or medium sherry, then return the tin to the oven for 7 minutes. Pour in the blood orange juice and season with a little black pepper. Lift the roast fennel on to a serving dish, scatter with the slices of blood orange and their juice, the toasted flaked almonds and the fennel fronds. Trickle over the juices from the tin.',
			},
		],
		isAppReady: false,
		mealTypeIds: ['easy', 'midweek', 'side'],
		serves: [
			{
				amount: {
					min: 4,
					max: 4,
				},
				text: 'Serves 4 as part of a light supper',
				unit: 'people',
			},
		],
		suitableForDietIds: [
			'dairy-free',
			'meat-free',
			'gluten-free',
			'pescatarian',
			'vegetarian',
			'vegan',
		],
		techniquesUsedIds: [],
		timings: [
			{
				durationInMins: {
					min: 40,
					max: 40,
				},
				qualifier: 'total-time',
			},
		],
		title: 'Title 3',
		utensilsAndApplianceIds: [],
	},
] as RecipeFixture[];
