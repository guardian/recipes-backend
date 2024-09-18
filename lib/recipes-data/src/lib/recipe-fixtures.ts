import { AssetType } from '@guardian/content-api-models/v1/assetType';
import type { Block } from "@guardian/content-api-models/v1/block";
import type { BlockElement } from '@guardian/content-api-models/v1/blockElement';
import { ElementType } from '@guardian/content-api-models/v1/elementType';
import type { Sponsorship } from '@guardian/content-api-models/v1/sponsorship';
import { SponsorshipType } from '@guardian/content-api-models/v1/sponsorshipType';
import Int64 from 'node-int64';
import type { RecipeImage } from "./models";
import { makeCapiDateTime } from './utils';

export type RecipeFixture = Record<string, unknown> & {
	id: string;
	canonicalArticle: string;
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

export const canonicalId =
'lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers';

export const block: Block = {
  id: '5a4b754ce4b0e33567c465c7',
  bodyHtml:
    '<figure class="element element-image" data-media-id="58c32a98ae4463b5129bf717b1b2312d8ffc0d45"> <img src="https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg" alt="Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing." width="1000" height="600" class="gu-image" /> <figcaption> <span class="element-image__caption">Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.</span> <span class="element-image__credit">Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay</span> </figcaption> </figure>',
  bodyTextSummary: '',
  attributes: {},
  published: true,
  contributors: [],
  createdBy: {
    email: 'stephanie.fincham@guardian.co.uk',
    firstName: 'Stephanie',
    lastName: 'Fincham',
  },
  lastModifiedBy: {
    email: 'stephanie.fincham@guardian.co.uk',
    firstName: 'Stephanie',
    lastName: 'Fincham',
  },
  elements: []
};

export const singleRecipeElement: BlockElement[] = [
  {
    type: ElementType.TEXT,
    assets: [],
    textTypeData: {
      html: '<p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> \n<p><strong>And for the rest of the week…</strong></p> \n<p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>',
    },
  },
  {
    type: ElementType.RECIPE,
    assets: [],
    recipeTypeData: {
      recipeJson:
        '{"id":"1","canonicalArticle":"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers","title":"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing","featuredImage":"58c32a98ae4463b5129bf717b1b2312d8ffc0d45","contributors":[{"type":"contributor","tagId":"profile/thomasina-miers"}],"ingredients":[{"recipeSection":"For the dressing","ingredientsList":[{"item":"soba","unit":"g","comment":"or glass noodles","text":"200g soba or glass noodles"},{"item":"frozen soya beans","unit":"g","comment":"","text":"50g frozen soya beans"},{"item":"sesame oil","unit":"tbsp","comment":"","text":"1 tbsp sesame oil"},{"item":"carrots","unit":"","comment":"peeled then grated or cut into thin ribbons","text":"2 carrots, peeled, then grated or cut into thin ribbons"},{"item":"red cabbage","unit":"g","comment":"finely shredded","text":"150g red cabbage, finely shredded"},{"item":"mooli","unit":"g","comment":"or radishes cut into matchsticks or thin slivers","text":"100g mooli or radishes, cut into matchsticks or thin slivers"},{"item":"green apple","unit":"","comment":"","text":"1 green apple"},{"item":"spring onions","unit":"","comment":"finely sliced","text":"3 spring onions, finely sliced"},{"item":"coriander","unit":"small bunch","comment":"roughly chopped","text":"1 small bunch coriander, roughly chopped"},{"item":"mint leaves","unit":"handful","comment":"roughly torn","text":"1 handful mint leaves, roughly torn"},{"item":"basil leaves","unit":"handful","comment":"or more coriander roughly chopped","text":"1 handful basil leaves (or more coriander), roughly chopped"},{"item":"toasted sunflower seeds","unit":"g","comment":"","text":"40g toasted sunflower seeds"},{"item":"toasted sesame seeds","unit":"g","comment":"a mixture of black and white looks good to serve","text":"25g toasted sesame seeds (a mixture of black and white looks good), to serve"}]},{"recipeSection":"And for the rest of the week…","ingredientsList":[{"item":"fresh ginger","unit":"thumb","comment":"sized chunk  peeled","text":"1 thumb-sized chunk fresh ginger, peeled"},{"item":"garlic","unit":"clove","comment":"","text":"½ garlic clove"},{"item":"tahini","unit":"g","comment":"","text":"50g tahini"},{"item":"lime","unit":"","comment":"Juice of","text":"Juice of 1 lime"},{"item":"sriracha","unit":"tbsp","comment":"or your favourite style of chilli sauce","text":"1 tbsp sriracha (or your favourite style of chilli sauce)"},{"item":"bird’s","unit":"","comment":"eye chilli stalked removed optional","text":"1 bird’s-eye chilli, stalked removed (optional)"},{"item":"soy sauce","unit":"tbsp","comment":"","text":"1 tbsp soy sauce"},{"item":"demerara sugar","unit":"tbsp","comment":"","text":"1 tbsp demerara sugar"},{"item":"","unit":"","comment":"or honey","text":"(or honey)"},{"item":"sesame oil","unit":"tbsp","comment":"","text":"3 tbsp sesame oil"},{"item":"water","unit":"ml","comment":"","text":"25ml water"}]}],"suitableForDietIds":[],"cuisineIds":[],"mealTypeIds":[],"celebrationsIds":["summer-food-and-drink"],"utensilsAndApplianceIds":[],"techniquesUsedIds":[],"timings":[],"instructions":[{"stepNumber":0,"description":"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.","images":[]},{"stepNumber":1,"description":"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).","images":[]},{"stepNumber":2,"description":"Add the carrots, red cabbage and mooli or radishes to the bowl.","images":[]},{"stepNumber":3,"description":"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.","images":[]},{"stepNumber":4,"description":"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).","images":[]},{"stepNumber":5,"description":"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.","images":[]},{"stepNumber":6,"description":"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.","images":[]},{"stepNumber":7,"description":"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.","images":[]},{"stepNumber":8,"description":"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.","images":[]},{"stepNumber":9,"description":"Toss the dressing through the salad and season to taste; it may need more lime juice.","images":[]},{"stepNumber":10,"description":"Scatter the sesame seeds on top and serve.","images":[]},{"stepNumber":11,"description":"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.","images":[]}]}',
    },
  },
  {
    type: ElementType.IMAGE,
    assets: [
      {
        type: AssetType.IMAGE,
        mimeType: 'image/jpeg',
        file: 'https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg',
        typeData: {
          aspectRatio: '5:3',
          width: 1000,
          height: 600,
        },
      },
      {
        type: AssetType.IMAGE,
        mimeType: 'image/jpeg',
        file: 'https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/500.jpg',
        typeData: {
          aspectRatio: '5:3',
          width: 500,
          height: 300,
        },
      },
      {
        type: AssetType.IMAGE,
        mimeType: 'image/jpeg',
        file: 'http://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/master/5512.jpg',
        typeData: {
          aspectRatio: '5:3',
          width: 5512,
          height: 3308,
          isMaster: true,
        },
      },
    ],
    imageTypeData: {
      caption:
        'Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.',
      copyright: 'LOUISE HAGGER',
      displayCredit: true,
      credit:
        'Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay',
      source:
        'Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay',
      alt: 'Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.',
      mediaId: '58c32a98ae4463b5129bf717b1b2312d8ffc0d45',
      mediaApiUri:
        'https://api.media.gutools.co.uk/images/58c32a98ae4463b5129bf717b1b2312d8ffc0d45',
      suppliersReference:
        'Soba noodles with crisp rainbow vegetables and a spicy sesame se',
      imageType: 'Photograph',
    },
  },
];

export const multipleRecipeElements: BlockElement[] = [
  {
    type: ElementType.TEXT,
    assets: [],
    textTypeData: {
      html: '<p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> \n<p><strong>And for the rest of the week…</strong></p> \n<p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>',
    },
  },
  {
    type: ElementType.RECIPE,
    assets: [],
    recipeTypeData: {
      recipeJson:
        '{"id":"1","canonicalArticle":"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers","title":"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing","featuredImage":"58c32a98ae4463b5129bf717b1b2312d8ffc0d45","contributors":[{"type":"contributor","tagId":"profile/thomasina-miers"}],"ingredients":[{"recipeSection":"For the dressing","ingredientsList":[{"item":"soba","unit":"g","comment":"or glass noodles","text":"200g soba or glass noodles"},{"item":"frozen soya beans","unit":"g","comment":"","text":"50g frozen soya beans"},{"item":"sesame oil","unit":"tbsp","comment":"","text":"1 tbsp sesame oil"},{"item":"carrots","unit":"","comment":"peeled then grated or cut into thin ribbons","text":"2 carrots, peeled, then grated or cut into thin ribbons"},{"item":"red cabbage","unit":"g","comment":"finely shredded","text":"150g red cabbage, finely shredded"},{"item":"mooli","unit":"g","comment":"or radishes cut into matchsticks or thin slivers","text":"100g mooli or radishes, cut into matchsticks or thin slivers"},{"item":"green apple","unit":"","comment":"","text":"1 green apple"},{"item":"spring onions","unit":"","comment":"finely sliced","text":"3 spring onions, finely sliced"},{"item":"coriander","unit":"small bunch","comment":"roughly chopped","text":"1 small bunch coriander, roughly chopped"},{"item":"mint leaves","unit":"handful","comment":"roughly torn","text":"1 handful mint leaves, roughly torn"},{"item":"basil leaves","unit":"handful","comment":"or more coriander roughly chopped","text":"1 handful basil leaves (or more coriander), roughly chopped"},{"item":"toasted sunflower seeds","unit":"g","comment":"","text":"40g toasted sunflower seeds"},{"item":"toasted sesame seeds","unit":"g","comment":"a mixture of black and white looks good to serve","text":"25g toasted sesame seeds (a mixture of black and white looks good), to serve"}]},{"recipeSection":"And for the rest of the week…","ingredientsList":[{"item":"fresh ginger","unit":"thumb","comment":"sized chunk  peeled","text":"1 thumb-sized chunk fresh ginger, peeled"},{"item":"garlic","unit":"clove","comment":"","text":"½ garlic clove"},{"item":"tahini","unit":"g","comment":"","text":"50g tahini"},{"item":"lime","unit":"","comment":"Juice of","text":"Juice of 1 lime"},{"item":"sriracha","unit":"tbsp","comment":"or your favourite style of chilli sauce","text":"1 tbsp sriracha (or your favourite style of chilli sauce)"},{"item":"bird’s","unit":"","comment":"eye chilli stalked removed optional","text":"1 bird’s-eye chilli, stalked removed (optional)"},{"item":"soy sauce","unit":"tbsp","comment":"","text":"1 tbsp soy sauce"},{"item":"demerara sugar","unit":"tbsp","comment":"","text":"1 tbsp demerara sugar"},{"item":"","unit":"","comment":"or honey","text":"(or honey)"},{"item":"sesame oil","unit":"tbsp","comment":"","text":"3 tbsp sesame oil"},{"item":"water","unit":"ml","comment":"","text":"25ml water"}]}],"suitableForDietIds":[],"cuisineIds":[],"mealTypeIds":[],"celebrationsIds":["summer-food-and-drink"],"utensilsAndApplianceIds":[],"techniquesUsedIds":[],"timings":[],"instructions":[{"stepNumber":0,"description":"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.","images":[]},{"stepNumber":1,"description":"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).","images":[]},{"stepNumber":2,"description":"Add the carrots, red cabbage and mooli or radishes to the bowl.","images":[]},{"stepNumber":3,"description":"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.","images":[]},{"stepNumber":4,"description":"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).","images":[]},{"stepNumber":5,"description":"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.","images":[]},{"stepNumber":6,"description":"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.","images":[]},{"stepNumber":7,"description":"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.","images":[]},{"stepNumber":8,"description":"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.","images":[]},{"stepNumber":9,"description":"Toss the dressing through the salad and season to taste; it may need more lime juice.","images":[]},{"stepNumber":10,"description":"Scatter the sesame seeds on top and serve.","images":[]},{"stepNumber":11,"description":"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.","images":[]}]}',
    },
  },
  {
    type: ElementType.RECIPE,
    assets: [],
    recipeTypeData: {
      recipeJson:
        '{"id":"1","canonicalArticle":"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers","title":"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing","featuredImage":"58c32a98ae4463b5129bf717b1b2312d8ffc0d45","contributors":[{"type":"contributor","tagId":"profile/thomasina-miers"}],"ingredients":[{"recipeSection":"For the dressing","ingredientsList":[{"item":"soba","unit":"g","comment":"or glass noodles","text":"200g soba or glass noodles"},{"item":"frozen soya beans","unit":"g","comment":"","text":"50g frozen soya beans"},{"item":"sesame oil","unit":"tbsp","comment":"","text":"1 tbsp sesame oil"},{"item":"carrots","unit":"","comment":"peeled then grated or cut into thin ribbons","text":"2 carrots, peeled, then grated or cut into thin ribbons"},{"item":"red cabbage","unit":"g","comment":"finely shredded","text":"150g red cabbage, finely shredded"},{"item":"mooli","unit":"g","comment":"or radishes cut into matchsticks or thin slivers","text":"100g mooli or radishes, cut into matchsticks or thin slivers"},{"item":"green apple","unit":"","comment":"","text":"1 green apple"},{"item":"spring onions","unit":"","comment":"finely sliced","text":"3 spring onions, finely sliced"},{"item":"coriander","unit":"small bunch","comment":"roughly chopped","text":"1 small bunch coriander, roughly chopped"},{"item":"mint leaves","unit":"handful","comment":"roughly torn","text":"1 handful mint leaves, roughly torn"},{"item":"basil leaves","unit":"handful","comment":"or more coriander roughly chopped","text":"1 handful basil leaves (or more coriander), roughly chopped"},{"item":"toasted sunflower seeds","unit":"g","comment":"","text":"40g toasted sunflower seeds"},{"item":"toasted sesame seeds","unit":"g","comment":"a mixture of black and white looks good to serve","text":"25g toasted sesame seeds (a mixture of black and white looks good), to serve"}]},{"recipeSection":"And for the rest of the week…","ingredientsList":[{"item":"fresh ginger","unit":"thumb","comment":"sized chunk  peeled","text":"1 thumb-sized chunk fresh ginger, peeled"},{"item":"garlic","unit":"clove","comment":"","text":"½ garlic clove"},{"item":"tahini","unit":"g","comment":"","text":"50g tahini"},{"item":"lime","unit":"","comment":"Juice of","text":"Juice of 1 lime"},{"item":"sriracha","unit":"tbsp","comment":"or your favourite style of chilli sauce","text":"1 tbsp sriracha (or your favourite style of chilli sauce)"},{"item":"bird’s","unit":"","comment":"eye chilli stalked removed optional","text":"1 bird’s-eye chilli, stalked removed (optional)"},{"item":"soy sauce","unit":"tbsp","comment":"","text":"1 tbsp soy sauce"},{"item":"demerara sugar","unit":"tbsp","comment":"","text":"1 tbsp demerara sugar"},{"item":"","unit":"","comment":"or honey","text":"(or honey)"},{"item":"sesame oil","unit":"tbsp","comment":"","text":"3 tbsp sesame oil"},{"item":"water","unit":"ml","comment":"","text":"25ml water"}]}],"suitableForDietIds":[],"cuisineIds":[],"mealTypeIds":[],"celebrationsIds":["summer-food-and-drink"],"utensilsAndApplianceIds":[],"techniquesUsedIds":[],"timings":[],"instructions":[{"stepNumber":0,"description":"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.","images":[]},{"stepNumber":1,"description":"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).","images":[]},{"stepNumber":2,"description":"Add the carrots, red cabbage and mooli or radishes to the bowl.","images":[]},{"stepNumber":3,"description":"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.","images":[]},{"stepNumber":4,"description":"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).","images":[]},{"stepNumber":5,"description":"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.","images":[]},{"stepNumber":6,"description":"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.","images":[]},{"stepNumber":7,"description":"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.","images":[]},{"stepNumber":8,"description":"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.","images":[]},{"stepNumber":9,"description":"Toss the dressing through the salad and season to taste; it may need more lime juice.","images":[]},{"stepNumber":10,"description":"Scatter the sesame seeds on top and serve.","images":[]},{"stepNumber":11,"description":"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.","images":[]}]}',
    },
  },
  {
    type: ElementType.RECIPE,
    assets: [],
    recipeTypeData: {
      recipeJson:
        '{"id":"1","canonicalArticle":"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers","title":"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing","featuredImage":"58c32a98ae4463b5129bf717b1b2312d8ffc0d45","contributors":[{"type":"contributor","tagId":"profile/thomasina-miers"}],"ingredients":[{"recipeSection":"For the dressing","ingredientsList":[{"item":"soba","unit":"g","comment":"or glass noodles","text":"200g soba or glass noodles"},{"item":"frozen soya beans","unit":"g","comment":"","text":"50g frozen soya beans"},{"item":"sesame oil","unit":"tbsp","comment":"","text":"1 tbsp sesame oil"},{"item":"carrots","unit":"","comment":"peeled then grated or cut into thin ribbons","text":"2 carrots, peeled, then grated or cut into thin ribbons"},{"item":"red cabbage","unit":"g","comment":"finely shredded","text":"150g red cabbage, finely shredded"},{"item":"mooli","unit":"g","comment":"or radishes cut into matchsticks or thin slivers","text":"100g mooli or radishes, cut into matchsticks or thin slivers"},{"item":"green apple","unit":"","comment":"","text":"1 green apple"},{"item":"spring onions","unit":"","comment":"finely sliced","text":"3 spring onions, finely sliced"},{"item":"coriander","unit":"small bunch","comment":"roughly chopped","text":"1 small bunch coriander, roughly chopped"},{"item":"mint leaves","unit":"handful","comment":"roughly torn","text":"1 handful mint leaves, roughly torn"},{"item":"basil leaves","unit":"handful","comment":"or more coriander roughly chopped","text":"1 handful basil leaves (or more coriander), roughly chopped"},{"item":"toasted sunflower seeds","unit":"g","comment":"","text":"40g toasted sunflower seeds"},{"item":"toasted sesame seeds","unit":"g","comment":"a mixture of black and white looks good to serve","text":"25g toasted sesame seeds (a mixture of black and white looks good), to serve"}]},{"recipeSection":"And for the rest of the week…","ingredientsList":[{"item":"fresh ginger","unit":"thumb","comment":"sized chunk  peeled","text":"1 thumb-sized chunk fresh ginger, peeled"},{"item":"garlic","unit":"clove","comment":"","text":"½ garlic clove"},{"item":"tahini","unit":"g","comment":"","text":"50g tahini"},{"item":"lime","unit":"","comment":"Juice of","text":"Juice of 1 lime"},{"item":"sriracha","unit":"tbsp","comment":"or your favourite style of chilli sauce","text":"1 tbsp sriracha (or your favourite style of chilli sauce)"},{"item":"bird’s","unit":"","comment":"eye chilli stalked removed optional","text":"1 bird’s-eye chilli, stalked removed (optional)"},{"item":"soy sauce","unit":"tbsp","comment":"","text":"1 tbsp soy sauce"},{"item":"demerara sugar","unit":"tbsp","comment":"","text":"1 tbsp demerara sugar"},{"item":"","unit":"","comment":"or honey","text":"(or honey)"},{"item":"sesame oil","unit":"tbsp","comment":"","text":"3 tbsp sesame oil"},{"item":"water","unit":"ml","comment":"","text":"25ml water"}]}],"suitableForDietIds":[],"cuisineIds":[],"mealTypeIds":[],"celebrationsIds":["summer-food-and-drink"],"utensilsAndApplianceIds":[],"techniquesUsedIds":[],"timings":[],"instructions":[{"stepNumber":0,"description":"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.","images":[]},{"stepNumber":1,"description":"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).","images":[]},{"stepNumber":2,"description":"Add the carrots, red cabbage and mooli or radishes to the bowl.","images":[]},{"stepNumber":3,"description":"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.","images":[]},{"stepNumber":4,"description":"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).","images":[]},{"stepNumber":5,"description":"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.","images":[]},{"stepNumber":6,"description":"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.","images":[]},{"stepNumber":7,"description":"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.","images":[]},{"stepNumber":8,"description":"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.","images":[]},{"stepNumber":9,"description":"Toss the dressing through the salad and season to taste; it may need more lime juice.","images":[]},{"stepNumber":10,"description":"Scatter the sesame seeds on top and serve.","images":[]},{"stepNumber":11,"description":"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.","images":[]}]}',
    },
  },
  {
    type: ElementType.IMAGE,
    assets: [
      {
        type: AssetType.IMAGE,
        mimeType: 'image/jpeg',
        file: 'https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg',
        typeData: {
          aspectRatio: '5:3',
          width: 1000,
          height: 600,
        },
      },
      {
        type: AssetType.IMAGE,
        mimeType: 'image/jpeg',
        file: 'https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/500.jpg',
        typeData: {
          aspectRatio: '5:3',
          width: 500,
          height: 300,
        },
      },
      {
        type: AssetType.IMAGE,
        mimeType: 'image/jpeg',
        file: 'http://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/master/5512.jpg',
        typeData: {
          aspectRatio: '5:3',
          width: 5512,
          height: 3308,
          isMaster: true,
        },
      },
    ],
    imageTypeData: {
      caption:
        'Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.',
      copyright: 'LOUISE HAGGER',
      displayCredit: true,
      credit:
        'Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay',
      source:
        'Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay',
      alt: 'Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.',
      mediaId: '58c32a98ae4463b5129bf717b1b2312d8ffc0d45',
      mediaApiUri:
        'https://api.media.gutools.co.uk/images/58c32a98ae4463b5129bf717b1b2312d8ffc0d45',
      suppliersReference:
        'Soba noodles with crisp rainbow vegetables and a spicy sesame se',
      imageType: 'Photograph',
    },
  },
];

export const noRecipeElements: BlockElement[] = [
  {
    type: ElementType.TEXT,
    assets: [],
    textTypeData: {
      html: '<p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> \n<p><strong>And for the rest of the week…</strong></p> \n<p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>',
    },
  },
  {
    type: ElementType.IMAGE,
    assets: [
      {
        type: AssetType.IMAGE,
        mimeType: 'image/jpeg',
        file: 'https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg',
        typeData: {
          aspectRatio: '5:3',
          width: 1000,
          height: 600,
        },
      },
      {
        type: AssetType.IMAGE,
        mimeType: 'image/jpeg',
        file: 'https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/500.jpg',
        typeData: {
          aspectRatio: '5:3',
          width: 500,
          height: 300,
        },
      },
      {
        type: AssetType.IMAGE,
        mimeType: 'image/jpeg',
        file: 'http://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/master/5512.jpg',
        typeData: {
          aspectRatio: '5:3',
          width: 5512,
          height: 3308,
          isMaster: true,
        },
      },
    ],
    imageTypeData: {
      caption:
        'Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.',
      copyright: 'LOUISE HAGGER',
      displayCredit: true,
      credit:
        'Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay',
      source:
        'Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay',
      alt: 'Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.',
      mediaId: '58c32a98ae4463b5129bf717b1b2312d8ffc0d45',
      mediaApiUri:
        'https://api.media.gutools.co.uk/images/58c32a98ae4463b5129bf717b1b2312d8ffc0d45',
      suppliersReference:
        'Soba noodles with crisp rainbow vegetables and a spicy sesame se',
      imageType: 'Photograph',
    },
  },
];

export const invalidRecipeElements: BlockElement[] = [
  {
    type: ElementType.TEXT,
    assets: [],
    textTypeData: {
      html: '<p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> \n<p><strong>And for the rest of the week…</strong></p> \n<p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>',
    },
  },
  {
    type: ElementType.RECIPE,
    assets: [],
    recipeTypeData: {
      recipeJson:
        '{"canonicalArticle":"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers","title":"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing","featuredImage":"58c32a98ae4463b5129bf717b1b2312d8ffc0d45","contributors":[],"byline":"Thomasina Miers","ingredients":[{"recipeSection":"For the dressing","ingredientsList":[{"item":"soba","unit":"g","comment":"or glass noodles","text":"200g soba or glass noodles"},{"item":"frozen soya beans","unit":"g","comment":"","text":"50g frozen soya beans"},{"item":"sesame oil","unit":"tbsp","comment":"","text":"1 tbsp sesame oil"},{"item":"carrots","unit":"","comment":"peeled then grated or cut into thin ribbons","text":"2 carrots, peeled, then grated or cut into thin ribbons"},{"item":"red cabbage","unit":"g","comment":"finely shredded","text":"150g red cabbage, finely shredded"},{"item":"mooli","unit":"g","comment":"or radishes cut into matchsticks or thin slivers","text":"100g mooli or radishes, cut into matchsticks or thin slivers"},{"item":"green apple","unit":"","comment":"","text":"1 green apple"},{"item":"spring onions","unit":"","comment":"finely sliced","text":"3 spring onions, finely sliced"},{"item":"coriander","unit":"small bunch","comment":"roughly chopped","text":"1 small bunch coriander, roughly chopped"},{"item":"mint leaves","unit":"handful","comment":"roughly torn","text":"1 handful mint leaves, roughly torn"},{"item":"basil leaves","unit":"handful","comment":"or more coriander roughly chopped","text":"1 handful basil leaves (or more coriander), roughly chopped"},{"item":"toasted sunflower seeds","unit":"g","comment":"","text":"40g toasted sunflower seeds"},{"item":"toasted sesame seeds","unit":"g","comment":"a mixture of black and white looks good to serve","text":"25g toasted sesame seeds (a mixture of black and white looks good), to serve"}]},{"recipeSection":"And for the rest of the week…","ingredientsList":[{"item":"fresh ginger","unit":"thumb","comment":"sized chunk  peeled","text":"1 thumb-sized chunk fresh ginger, peeled"},{"item":"garlic","unit":"clove","comment":"","text":"½ garlic clove"},{"item":"tahini","unit":"g","comment":"","text":"50g tahini"},{"item":"lime","unit":"","comment":"Juice of","text":"Juice of 1 lime"},{"item":"sriracha","unit":"tbsp","comment":"or your favourite style of chilli sauce","text":"1 tbsp sriracha (or your favourite style of chilli sauce)"},{"item":"bird’s","unit":"","comment":"eye chilli stalked removed optional","text":"1 bird’s-eye chilli, stalked removed (optional)"},{"item":"soy sauce","unit":"tbsp","comment":"","text":"1 tbsp soy sauce"},{"item":"demerara sugar","unit":"tbsp","comment":"","text":"1 tbsp demerara sugar"},{"item":"","unit":"","comment":"or honey","text":"(or honey)"},{"item":"sesame oil","unit":"tbsp","comment":"","text":"3 tbsp sesame oil"},{"item":"water","unit":"ml","comment":"","text":"25ml water"}]}],"suitableForDietIds":[],"cuisineIds":[],"mealTypeIds":[],"celebrationsIds":["summer-food-and-drink"],"utensilsAndApplianceIds":[],"techniquesUsedIds":[],"timings":[],"instructions":[{"stepNumber":0,"description":"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.","images":[]},{"stepNumber":1,"description":"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).","images":[]},{"stepNumber":2,"description":"Add the carrots, red cabbage and mooli or radishes to the bowl.","images":[]},{"stepNumber":3,"description":"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.","images":[]},{"stepNumber":4,"description":"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).","images":[]},{"stepNumber":5,"description":"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.","images":[]},{"stepNumber":6,"description":"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.","images":[]},{"stepNumber":7,"description":"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.","images":[]},{"stepNumber":8,"description":"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.","images":[]},{"stepNumber":9,"description":"Toss the dressing through the salad and season to taste; it may need more lime juice.","images":[]},{"stepNumber":10,"description":"Scatter the sesame seeds on top and serve.","images":[]},{"stepNumber":11,"description":"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.","images":[]}]}',
    },
  },
  {
    type: ElementType.IMAGE,
    assets: [
      {
        type: AssetType.IMAGE,
        mimeType: 'image/jpeg',
        file: 'https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg',
        typeData: {
          aspectRatio: '5:3',
          width: 1000,
          height: 600,
        },
      },
      {
        type: AssetType.IMAGE,
        mimeType: 'image/jpeg',
        file: 'https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/500.jpg',
        typeData: {
          aspectRatio: '5:3',
          width: 500,
          height: 300,
        },
      },
      {
        type: AssetType.IMAGE,
        mimeType: 'image/jpeg',
        file: 'http://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/master/5512.jpg',
        typeData: {
          aspectRatio: '5:3',
          width: 5512,
          height: 3308,
          isMaster: true,
        },
      },
    ],
    imageTypeData: {
      caption:
        'Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.',
      copyright: 'LOUISE HAGGER',
      displayCredit: true,
      credit:
        'Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay',
      source:
        'Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay',
      alt: 'Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.',
      mediaId: '58c32a98ae4463b5129bf717b1b2312d8ffc0d45',
      mediaApiUri:
        'https://api.media.gutools.co.uk/images/58c32a98ae4463b5129bf717b1b2312d8ffc0d45',
      suppliersReference:
        'Soba noodles with crisp rainbow vegetables and a spicy sesame se',
      imageType: 'Photograph',
    },
  },
];

export const activeSponsorships: Sponsorship[] = [
  {
    sponsorshipType: SponsorshipType.SPONSORED,
    sponsorName: 'theguardian.org',
    sponsorLogo:
      'https://static.theguardian.com/commercial/sponsor/22/Feb/2024/f459c58b-6553-486d-939a-5f23fd935f78-Guardian.orglogos-for badge.png',
    sponsorLink: 'https://theguardian.org/',
    aboutLink:
      'https://www.theguardian.com/global-development/2010/sep/14/about-this-site',
    sponsorLogoDimensions: {
      width: 280,
      height: 180,
    },
    highContrastSponsorLogo:
      'https://static.theguardian.com/commercial/sponsor/22/Feb/2024/3d8e52dc-1d0b-4f95-8cd1-48a674e1309d-guardian.org new logo - white version (3).png',
    highContrastSponsorLogoDimensions: {
      width: 280,
      height: 180,
    },
    validFrom: makeCapiDateTime('2023-09-21T16:18:10Z'),
    validTo: makeCapiDateTime('2026-08-30T23:00:00Z'),
  },
];

export const recipeDates = {
  lastModifiedDate: {
    dateTime: new Int64(new Date('2024-09-10T16:18:10Z').getTime()),
    iso8601: '2024-09-10T16:18:10Z',
  },
  firstPublishedDate: {
    dateTime: new Int64(new Date('2024-09-02T10:04:16Z').getTime()),
    iso8601: '2024-09-02T10:04:16Z',
  },
  publishedDate: {
    dateTime: new Int64(new Date('2024-09-10T16:22:07Z').getTime()),
    iso8601: '2023-09-10T16:22:07Z',
  },
};
