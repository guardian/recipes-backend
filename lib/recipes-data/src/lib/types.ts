export type Recipe = {
	id: string;
	composerId: string;
	canonicalArticle: string;
	title: string;
	description: string;
	isAppReady: boolean;
	featuredImage: RecipeImage;
	previewImage?: RecipeImage;
	contributors: Contributor[];
	ingredients: IngredientsGroup[];
	suitableForDietIds: string[];
	cuisineIds: string[];
	mealTypeIds: string[];
	celebrationIds: string[];
	utensilsAndApplianceIds: string[];
	techniquesUsedIds: string[];
	difficultyLevel?: string;
	serves: Serves[];
	timings: Timing[];
	instructions: Instruction[];
	bookCredit: string;
	byline?: string[];
};

export type IngredientsGroup = {
	recipeSection: string;
	ingredientsList: Ingredient[];
};

export type Serves = {
	amount: Range;
	unit?: string;
	text: string;
};

export type Ingredient = {
	name: string;
	ingredientId?: string;
	amount?: Range;
	unit?: string;
	prefix?: string;
	suffix?: string;
	text?: string;
	optional: boolean;
};

export type Timing = {
	qualifier: string;
	durationInMins: Range;
	text?: string;
};

export type Instruction = {
	description: string;
	images?: RecipeImage[];
	stepNumber?: number;
};

export type Contributor =
	| { type: 'contributor'; tagId: string }
	| { type: 'freetext'; text: string };

export type RecipeImage = {
	url: string;
	mediaId: string;
	cropId?: string;
	source?: string;
	photographer?: string;
	imageType?: string;
	caption?: string;
	mediaApiUri?: string;
	displayCredit?: boolean;
	width: number;
	height: number;
};

export type Range = { min: number | null; max: number | null };
