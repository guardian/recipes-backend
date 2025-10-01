from pydantic import BaseModel
from typing import Optional, Any, List, TypeVar, Type, cast, Callable


T = TypeVar("T")


def from_str(x: Any) -> str:
    assert isinstance(x, str)
    return x


def from_none(x: Any) -> Any:
    assert x is None
    return x


def from_union(fs, x):
    for f in fs:
        try:
            return f(x)
        except:
            pass
    assert False


def from_float(x: Any) -> float:
    assert isinstance(x, (float, int)) and not isinstance(x, bool)
    return float(x)


def to_float(x: Any) -> float:
    assert isinstance(x, (int, float))
    return x


def from_bool(x: Any) -> bool:
    assert isinstance(x, bool)
    return x


def to_class(c: Type[T], x: Any) -> dict:
    assert isinstance(x, c)
    return cast(Any, x).to_dict()


def from_list(f: Callable[[Any], T], x: Any) -> List[T]:
    assert isinstance(x, list)
    return [f(y) for y in x]


class Image(BaseModel):
    """Image metadata including URL, media identifiers, and attribution"""

    crop_id: str
    """Identifier for the specific crop of the image"""

    media_id: str
    """Unique identifier for the media"""

    url: str
    """The URL of the image"""

    caption: Optional[str] = None
    """Caption or description of the image"""

    image_type: Optional[str] = None
    """Type or category of the image"""

    media_api_url: Optional[str] = None
    """API URL for accessing the media"""

    photographer: Optional[str] = None
    """Name of the photographer"""

    source: Optional[str] = None
    """Source of the image"""

    @staticmethod
    def from_dict(obj: Any) -> 'Image':
        assert isinstance(obj, dict)
        crop_id = from_str(obj.get("cropId"))
        media_id = from_str(obj.get("mediaId"))
        url = from_str(obj.get("url"))
        caption = from_union([from_str, from_none], obj.get("caption"))
        image_type = from_union([from_str, from_none], obj.get("imageType"))
        media_api_url = from_union([from_str, from_none], obj.get("mediaApiUrl"))
        photographer = from_union([from_str, from_none], obj.get("photographer"))
        source = from_union([from_str, from_none], obj.get("source"))
        return Image(crop_id, media_id, url, caption, image_type, media_api_url, photographer, source)

    def to_dict(self) -> dict:
        result: dict = {}
        result["cropId"] = from_str(self.crop_id)
        result["mediaId"] = from_str(self.media_id)
        result["url"] = from_str(self.url)
        if self.caption is not None:
            result["caption"] = from_union([from_str, from_none], self.caption)
        if self.image_type is not None:
            result["imageType"] = from_union([from_str, from_none], self.image_type)
        if self.media_api_url is not None:
            result["mediaApiUrl"] = from_union([from_str, from_none], self.media_api_url)
        if self.photographer is not None:
            result["photographer"] = from_union([from_str, from_none], self.photographer)
        if self.source is not None:
            result["source"] = from_union([from_str, from_none], self.source)
        return result


class RangeClass(BaseModel):
    """A numeric range with minimum and maximum values"""

    max: float
    """The maximum value of the range"""

    min: float
    """The minimum value of the range"""

    @staticmethod
    def from_dict(obj: Any) -> 'RangeClass':
        assert isinstance(obj, dict)
        max = from_float(obj.get("max"))
        min = from_float(obj.get("min"))
        return RangeClass(max, min)

    def to_dict(self) -> dict:
        result: dict = {}
        result["max"] = to_float(self.max)
        result["min"] = to_float(self.min)
        return result


class IngredientItem(BaseModel):
    """Individual ingredient item with amount, unit, and optional modifiers"""

    amount: Optional[RangeClass] = None
    """Amount of the ingredient as a range or null"""

    ingredient_id: Optional[str] = None
    """Unique identifier for the ingredient"""

    name: Optional[str] = None
    """Name of the ingredient"""

    optional: Optional[bool] = None
    """Whether the ingredient is optional"""

    prefix: Optional[str] = None
    """Text prefix for the ingredient"""

    suffix: Optional[str] = None
    """Text suffix for the ingredient"""

    text: Optional[str] = None
    """Full text representation of the ingredient"""

    unit: Optional[str] = None
    """Unit of measurement for the ingredient"""

    @staticmethod
    def from_dict(obj: Any) -> 'IngredientItem':
        assert isinstance(obj, dict)
        amount = from_union([RangeClass.from_dict, from_none], obj.get("amount"))
        ingredient_id = from_union([from_str, from_none], obj.get("ingredientId"))
        name = from_union([from_none, from_str], obj.get("name"))
        optional = from_union([from_bool, from_none], obj.get("optional"))
        prefix = from_union([from_str, from_none], obj.get("prefix"))
        suffix = from_union([from_str, from_none], obj.get("suffix"))
        text = from_union([from_str, from_none], obj.get("text"))
        unit = from_union([from_none, from_str], obj.get("unit"))
        return IngredientItem(amount, ingredient_id, name, optional, prefix, suffix, text, unit)

    def to_dict(self) -> dict:
        result: dict = {}
        if self.amount is not None:
            result["amount"] = from_union([lambda x: to_class(RangeClass, x), from_none], self.amount)
        if self.ingredient_id is not None:
            result["ingredientId"] = from_union([from_str, from_none], self.ingredient_id)
        result["name"] = from_union([from_none, from_str], self.name)
        if self.optional is not None:
            result["optional"] = from_union([from_bool, from_none], self.optional)
        if self.prefix is not None:
            result["prefix"] = from_union([from_str, from_none], self.prefix)
        if self.suffix is not None:
            result["suffix"] = from_union([from_str, from_none], self.suffix)
        if self.text is not None:
            result["text"] = from_union([from_str, from_none], self.text)
        if self.unit is not None:
            result["unit"] = from_union([from_none, from_str], self.unit)
        return result


class IngredientsListElement(BaseModel):
    """Individual ingredient item with amount, unit, and optional modifiers"""

    amount: Optional[RangeClass] = None
    """Amount of the ingredient as a range or null"""

    ingredient_id: Optional[str] = None
    """Unique identifier for the ingredient"""

    name: Optional[str] = None
    """Name of the ingredient"""

    optional: Optional[bool] = None
    """Whether the ingredient is optional"""

    prefix: Optional[str] = None
    """Text prefix for the ingredient"""

    suffix: Optional[str] = None
    """Text suffix for the ingredient"""

    text: Optional[str] = None
    """Full text representation of the ingredient"""

    unit: Optional[str] = None
    """Unit of measurement for the ingredient"""

    @staticmethod
    def from_dict(obj: Any) -> 'IngredientsListElement':
        assert isinstance(obj, dict)
        amount = from_union([RangeClass.from_dict, from_none], obj.get("amount"))
        ingredient_id = from_union([from_str, from_none], obj.get("ingredientId"))
        name = from_union([from_none, from_str], obj.get("name"))
        optional = from_union([from_bool, from_none], obj.get("optional"))
        prefix = from_union([from_str, from_none], obj.get("prefix"))
        suffix = from_union([from_str, from_none], obj.get("suffix"))
        text = from_union([from_str, from_none], obj.get("text"))
        unit = from_union([from_none, from_str], obj.get("unit"))
        return IngredientsListElement(amount, ingredient_id, name, optional, prefix, suffix, text, unit)

    def to_dict(self) -> dict:
        result: dict = {}
        if self.amount is not None:
            result["amount"] = from_union([lambda x: to_class(RangeClass, x), from_none], self.amount)
        if self.ingredient_id is not None:
            result["ingredientId"] = from_union([from_str, from_none], self.ingredient_id)
        result["name"] = from_union([from_none, from_str], self.name)
        if self.optional is not None:
            result["optional"] = from_union([from_bool, from_none], self.optional)
        if self.prefix is not None:
            result["prefix"] = from_union([from_str, from_none], self.prefix)
        if self.suffix is not None:
            result["suffix"] = from_union([from_str, from_none], self.suffix)
        if self.text is not None:
            result["text"] = from_union([from_str, from_none], self.text)
        if self.unit is not None:
            result["unit"] = from_union([from_none, from_str], self.unit)
        return result


class IngredientsList(BaseModel):
    """A section of ingredients with an optional section name"""

    ingredients_list: Optional[List[IngredientsListElement]] = None
    """List of ingredients in this section"""

    recipe_section: Optional[str] = None
    """Name of the recipe section (e.g., 'For the sauce', 'For the garnish')"""

    @staticmethod
    def from_dict(obj: Any) -> 'IngredientsList':
        assert isinstance(obj, dict)
        ingredients_list = from_union([from_none, lambda x: from_list(IngredientsListElement.from_dict, x)], obj.get("ingredientsList"))
        recipe_section = from_union([from_none, from_str], obj.get("recipeSection"))
        return IngredientsList(ingredients_list, recipe_section)

    def to_dict(self) -> dict:
        result: dict = {}
        result["ingredientsList"] = from_union([from_none, lambda x: from_list(lambda x: to_class(IngredientsListElement, x), x)], self.ingredients_list)
        if self.recipe_section is not None:
            result["recipeSection"] = from_union([from_none, from_str], self.recipe_section)
        return result


class Instruction(BaseModel):
    """A single cooking instruction step with optional images"""

    description: str
    """Detailed description of the cooking step"""

    step_number: float
    """The sequential number of this instruction step"""

    images: Optional[List[str]] = None
    """Array of image URLs or identifiers for this step"""

    @staticmethod
    def from_dict(obj: Any) -> 'Instruction':
        assert isinstance(obj, dict)
        description = from_str(obj.get("description"))
        step_number = from_float(obj.get("stepNumber"))
        images = from_union([lambda x: from_list(from_str, x), from_none], obj.get("images"))
        return Instruction(description, step_number, images)

    def to_dict(self) -> dict:
        result: dict = {}
        result["description"] = from_str(self.description)
        result["stepNumber"] = to_float(self.step_number)
        if self.images is not None:
            result["images"] = from_union([lambda x: from_list(from_str, x), from_none], self.images)
        return result


class Range(BaseModel):
    """A numeric range with minimum and maximum values"""

    max: float
    """The maximum value of the range"""

    min: float
    """The minimum value of the range"""

    @staticmethod
    def from_dict(obj: Any) -> 'Range':
        assert isinstance(obj, dict)
        max = from_float(obj.get("max"))
        min = from_float(obj.get("min"))
        return Range(max, min)

    def to_dict(self) -> dict:
        result: dict = {}
        result["max"] = to_float(self.max)
        result["min"] = to_float(self.min)
        return result


class ImageClass(BaseModel):
    """Image metadata including URL, media identifiers, and attribution"""

    crop_id: str
    """Identifier for the specific crop of the image"""

    media_id: str
    """Unique identifier for the media"""

    url: str
    """The URL of the image"""

    caption: Optional[str] = None
    """Caption or description of the image"""

    image_type: Optional[str] = None
    """Type or category of the image"""

    media_api_url: Optional[str] = None
    """API URL for accessing the media"""

    photographer: Optional[str] = None
    """Name of the photographer"""

    source: Optional[str] = None
    """Source of the image"""

    @staticmethod
    def from_dict(obj: Any) -> 'ImageClass':
        assert isinstance(obj, dict)
        crop_id = from_str(obj.get("cropId"))
        media_id = from_str(obj.get("mediaId"))
        url = from_str(obj.get("url"))
        caption = from_union([from_str, from_none], obj.get("caption"))
        image_type = from_union([from_str, from_none], obj.get("imageType"))
        media_api_url = from_union([from_str, from_none], obj.get("mediaApiUrl"))
        photographer = from_union([from_str, from_none], obj.get("photographer"))
        source = from_union([from_str, from_none], obj.get("source"))
        return ImageClass(crop_id, media_id, url, caption, image_type, media_api_url, photographer, source)

    def to_dict(self) -> dict:
        result: dict = {}
        result["cropId"] = from_str(self.crop_id)
        result["mediaId"] = from_str(self.media_id)
        result["url"] = from_str(self.url)
        if self.caption is not None:
            result["caption"] = from_union([from_str, from_none], self.caption)
        if self.image_type is not None:
            result["imageType"] = from_union([from_str, from_none], self.image_type)
        if self.media_api_url is not None:
            result["mediaApiUrl"] = from_union([from_str, from_none], self.media_api_url)
        if self.photographer is not None:
            result["photographer"] = from_union([from_str, from_none], self.photographer)
        if self.source is not None:
            result["source"] = from_union([from_str, from_none], self.source)
        return result


class IngredientElement(BaseModel):
    """A section of ingredients with an optional section name"""

    ingredients_list: Optional[List[IngredientsListElement]] = None
    """List of ingredients in this section"""

    recipe_section: Optional[str] = None
    """Name of the recipe section (e.g., 'For the sauce', 'For the garnish')"""

    @staticmethod
    def from_dict(obj: Any) -> 'IngredientElement':
        assert isinstance(obj, dict)
        ingredients_list = from_union([from_none, lambda x: from_list(IngredientsListElement.from_dict, x)], obj.get("ingredientsList"))
        recipe_section = from_union([from_none, from_str], obj.get("recipeSection"))
        return IngredientElement(ingredients_list, recipe_section)

    def to_dict(self) -> dict:
        result: dict = {}
        result["ingredientsList"] = from_union([from_none, lambda x: from_list(lambda x: to_class(IngredientsListElement, x), x)], self.ingredients_list)
        if self.recipe_section is not None:
            result["recipeSection"] = from_union([from_none, from_str], self.recipe_section)
        return result


class InstructionElement(BaseModel):
    """A single cooking instruction step with optional images"""

    description: str
    """Detailed description of the cooking step"""

    step_number: float
    """The sequential number of this instruction step"""

    images: Optional[List[str]] = None
    """Array of image URLs or identifiers for this step"""

    @staticmethod
    def from_dict(obj: Any) -> 'InstructionElement':
        assert isinstance(obj, dict)
        description = from_str(obj.get("description"))
        step_number = from_float(obj.get("stepNumber"))
        images = from_union([lambda x: from_list(from_str, x), from_none], obj.get("images"))
        return InstructionElement(description, step_number, images)

    def to_dict(self) -> dict:
        result: dict = {}
        result["description"] = from_str(self.description)
        result["stepNumber"] = to_float(self.step_number)
        if self.images is not None:
            result["images"] = from_union([lambda x: from_list(from_str, x), from_none], self.images)
        return result


class ServeElement(BaseModel):
    """Information about how many servings the recipe makes"""

    unit: str
    """Unit for the serving amount (e.g., 'people', 'portions')"""

    amount: Optional[RangeClass] = None
    """Number of servings as a range or null"""

    text: Optional[str] = None
    """Human-readable text representation of the serving information"""

    @staticmethod
    def from_dict(obj: Any) -> 'ServeElement':
        assert isinstance(obj, dict)
        unit = from_str(obj.get("unit"))
        amount = from_union([RangeClass.from_dict, from_none], obj.get("amount"))
        text = from_union([from_str, from_none], obj.get("text"))
        return ServeElement(unit, amount, text)

    def to_dict(self) -> dict:
        result: dict = {}
        result["unit"] = from_str(self.unit)
        result["amount"] = from_union([lambda x: to_class(RangeClass, x), from_none], self.amount)
        if self.text is not None:
            result["text"] = from_union([from_str, from_none], self.text)
        return result


class TimingElement(BaseModel):
    """Timing information for recipe preparation or cooking"""

    duration_in_mins: Optional[RangeClass] = None
    """Duration in minutes as a range or null"""

    qualifier: Optional[str] = None
    """Type of timing (e.g., 'prep time', 'cook time', 'total time')"""

    text: Optional[str] = None
    """Human-readable text representation of the timing"""

    @staticmethod
    def from_dict(obj: Any) -> 'TimingElement':
        assert isinstance(obj, dict)
        duration_in_mins = from_union([RangeClass.from_dict, from_none], obj.get("durationInMins"))
        qualifier = from_union([from_none, from_str], obj.get("qualifier"))
        text = from_union([from_str, from_none], obj.get("text"))
        return TimingElement(duration_in_mins, qualifier, text)

    def to_dict(self) -> dict:
        result: dict = {}
        result["durationInMins"] = from_union([lambda x: to_class(RangeClass, x), from_none], self.duration_in_mins)
        result["qualifier"] = from_union([from_none, from_str], self.qualifier)
        if self.text is not None:
            result["text"] = from_union([from_str, from_none], self.text)
        return result


class Recipe(BaseModel):
    """Complete recipe with metadata, ingredients, instructions, and categorization"""

    id: str
    """Unique identifier for the recipe"""

    book_credit: Optional[str] = None
    """Credit to cookbook or publication source"""

    byline: Optional[List[str]] = None
    """Author or chef attribution"""

    canonical_article: Optional[str] = None
    """URL or identifier of the canonical article"""

    celebration_ids: Optional[List[Optional[str]]] = None
    """Identifiers for celebrations or holidays associated with the recipe"""

    composer_id: Optional[str] = None
    """Identifier for the content management system"""

    contributors: Optional[List[str]] = None
    """List of people who contributed to the recipe"""

    cuisine_ids: Optional[List[Optional[str]]] = None
    """Identifiers for cuisine types"""

    description: Optional[str] = None
    """Description or summary of the recipe"""

    difficulty_level: Optional[str] = None
    """Difficulty level of the recipe (e.g., 'easy', 'medium', 'hard')"""

    featured_image: Optional[ImageClass] = None
    """Main image for the recipe"""

    ingredients: Optional[List[IngredientElement]] = None
    """Ingredients organized by sections"""

    instructions: Optional[List[InstructionElement]] = None
    """Step-by-step cooking instructions"""

    is_app_ready: Optional[bool] = None
    """Whether the recipe is ready for app display"""

    meal_type_ids: Optional[List[Optional[str]]] = None
    """Identifiers for meal types (breakfast, lunch, dinner, etc.)"""

    serves: Optional[List[ServeElement]] = None
    """Information about how many people the recipe serves"""

    suitable_for_diet_ids: Optional[List[Optional[str]]] = None
    """Identifiers for dietary restrictions the recipe accommodates"""

    techniques_used_ids: Optional[List[Optional[str]]] = None
    """Identifiers for cooking techniques used in the recipe"""

    timings: Optional[List[TimingElement]] = None
    """Various timing information (prep, cook, total, etc.)"""

    title: Optional[str] = None
    """Title of the recipe"""

    utensils_and_appliance_ids: Optional[List[Optional[str]]] = None
    """Identifiers for required utensils and appliances"""

    web_publication_date: Optional[str] = None
    """Date when the recipe was published on the web"""

    @staticmethod
    def from_dict(obj: Any) -> 'Recipe':
        assert isinstance(obj, dict)
        id = from_str(obj.get("id"))
        book_credit = from_union([from_none, from_str], obj.get("bookCredit"))
        byline = from_union([lambda x: from_list(from_str, x), from_none], obj.get("byline"))
        canonical_article = from_union([from_none, from_str], obj.get("canonicalArticle"))
        celebration_ids = from_union([from_none, lambda x: from_list(lambda x: from_union([from_none, from_str], x), x)], obj.get("celebrationIds"))
        composer_id = from_union([from_none, from_str], obj.get("composerId"))
        contributors = from_union([lambda x: from_list(from_str, x), from_none], obj.get("contributors"))
        cuisine_ids = from_union([from_none, lambda x: from_list(lambda x: from_union([from_none, from_str], x), x)], obj.get("cuisineIds"))
        description = from_union([from_none, from_str], obj.get("description"))
        difficulty_level = from_union([from_none, from_str], obj.get("difficultyLevel"))
        featured_image = from_union([ImageClass.from_dict, from_none], obj.get("featuredImage"))
        ingredients = from_union([lambda x: from_list(IngredientElement.from_dict, x), from_none], obj.get("ingredients"))
        instructions = from_union([lambda x: from_list(InstructionElement.from_dict, x), from_none], obj.get("instructions"))
        is_app_ready = from_union([from_bool, from_none], obj.get("isAppReady"))
        meal_type_ids = from_union([from_none, lambda x: from_list(lambda x: from_union([from_none, from_str], x), x)], obj.get("mealTypeIds"))
        serves = from_union([lambda x: from_list(ServeElement.from_dict, x), from_none], obj.get("serves"))
        suitable_for_diet_ids = from_union([from_none, lambda x: from_list(lambda x: from_union([from_none, from_str], x), x)], obj.get("suitableForDietIds"))
        techniques_used_ids = from_union([from_none, lambda x: from_list(lambda x: from_union([from_none, from_str], x), x)], obj.get("techniquesUsedIds"))
        timings = from_union([lambda x: from_list(TimingElement.from_dict, x), from_none], obj.get("timings"))
        title = from_union([from_none, from_str], obj.get("title"))
        utensils_and_appliance_ids = from_union([from_none, lambda x: from_list(lambda x: from_union([from_none, from_str], x), x)], obj.get("utensilsAndApplianceIds"))
        web_publication_date = from_union([from_none, from_str], obj.get("webPublicationDate"))
        return Recipe(id, book_credit, byline, canonical_article, celebration_ids, composer_id, contributors, cuisine_ids, description, difficulty_level, featured_image, ingredients, instructions, is_app_ready, meal_type_ids, serves, suitable_for_diet_ids, techniques_used_ids, timings, title, utensils_and_appliance_ids, web_publication_date)

    def to_dict(self) -> dict:
        result: dict = {}
        result["id"] = from_str(self.id)
        if self.book_credit is not None:
            result["bookCredit"] = from_union([from_none, from_str], self.book_credit)
        if self.byline is not None:
            result["byline"] = from_union([lambda x: from_list(from_str, x), from_none], self.byline)
        if self.canonical_article is not None:
            result["canonicalArticle"] = from_union([from_none, from_str], self.canonical_article)
        if self.celebration_ids is not None:
            result["celebrationIds"] = from_union([from_none, lambda x: from_list(lambda x: from_union([from_none, from_str], x), x)], self.celebration_ids)
        if self.composer_id is not None:
            result["composerId"] = from_union([from_none, from_str], self.composer_id)
        if self.contributors is not None:
            result["contributors"] = from_union([lambda x: from_list(from_str, x), from_none], self.contributors)
        if self.cuisine_ids is not None:
            result["cuisineIds"] = from_union([from_none, lambda x: from_list(lambda x: from_union([from_none, from_str], x), x)], self.cuisine_ids)
        if self.description is not None:
            result["description"] = from_union([from_none, from_str], self.description)
        if self.difficulty_level is not None:
            result["difficultyLevel"] = from_union([from_none, from_str], self.difficulty_level)
        if self.featured_image is not None:
            result["featuredImage"] = from_union([lambda x: to_class(ImageClass, x), from_none], self.featured_image)
        if self.ingredients is not None:
            result["ingredients"] = from_union([lambda x: from_list(lambda x: to_class(IngredientElement, x), x), from_none], self.ingredients)
        if self.instructions is not None:
            result["instructions"] = from_union([lambda x: from_list(lambda x: to_class(InstructionElement, x), x), from_none], self.instructions)
        if self.is_app_ready is not None:
            result["isAppReady"] = from_union([from_bool, from_none], self.is_app_ready)
        if self.meal_type_ids is not None:
            result["mealTypeIds"] = from_union([from_none, lambda x: from_list(lambda x: from_union([from_none, from_str], x), x)], self.meal_type_ids)
        if self.serves is not None:
            result["serves"] = from_union([lambda x: from_list(lambda x: to_class(ServeElement, x), x), from_none], self.serves)
        if self.suitable_for_diet_ids is not None:
            result["suitableForDietIds"] = from_union([from_none, lambda x: from_list(lambda x: from_union([from_none, from_str], x), x)], self.suitable_for_diet_ids)
        if self.techniques_used_ids is not None:
            result["techniquesUsedIds"] = from_union([from_none, lambda x: from_list(lambda x: from_union([from_none, from_str], x), x)], self.techniques_used_ids)
        if self.timings is not None:
            result["timings"] = from_union([lambda x: from_list(lambda x: to_class(TimingElement, x), x), from_none], self.timings)
        if self.title is not None:
            result["title"] = from_union([from_none, from_str], self.title)
        if self.utensils_and_appliance_ids is not None:
            result["utensilsAndApplianceIds"] = from_union([from_none, lambda x: from_list(lambda x: from_union([from_none, from_str], x), x)], self.utensils_and_appliance_ids)
        if self.web_publication_date is not None:
            result["webPublicationDate"] = from_union([from_none, from_str], self.web_publication_date)
        return result


class Serves(BaseModel):
    """Information about how many servings the recipe makes"""

    unit: str
    """Unit for the serving amount (e.g., 'people', 'portions')"""

    amount: Optional[RangeClass] = None
    """Number of servings as a range or null"""

    text: Optional[str] = None
    """Human-readable text representation of the serving information"""

    @staticmethod
    def from_dict(obj: Any) -> 'Serves':
        assert isinstance(obj, dict)
        unit = from_str(obj.get("unit"))
        amount = from_union([RangeClass.from_dict, from_none], obj.get("amount"))
        text = from_union([from_str, from_none], obj.get("text"))
        return Serves(unit, amount, text)

    def to_dict(self) -> dict:
        result: dict = {}
        result["unit"] = from_str(self.unit)
        result["amount"] = from_union([lambda x: to_class(RangeClass, x), from_none], self.amount)
        if self.text is not None:
            result["text"] = from_union([from_str, from_none], self.text)
        return result


class Timing(BaseModel):
    """Timing information for recipe preparation or cooking"""

    duration_in_mins: Optional[RangeClass] = None
    """Duration in minutes as a range or null"""

    qualifier: Optional[str] = None
    """Type of timing (e.g., 'prep time', 'cook time', 'total time')"""

    text: Optional[str] = None
    """Human-readable text representation of the timing"""

    @staticmethod
    def from_dict(obj: Any) -> 'Timing':
        assert isinstance(obj, dict)
        duration_in_mins = from_union([RangeClass.from_dict, from_none], obj.get("durationInMins"))
        qualifier = from_union([from_none, from_str], obj.get("qualifier"))
        text = from_union([from_str, from_none], obj.get("text"))
        return Timing(duration_in_mins, qualifier, text)

    def to_dict(self) -> dict:
        result: dict = {}
        result["durationInMins"] = from_union([lambda x: to_class(RangeClass, x), from_none], self.duration_in_mins)
        result["qualifier"] = from_union([from_none, from_str], self.qualifier)
        if self.text is not None:
            result["text"] = from_union([from_str, from_none], self.text)
        return result


def image_from_dict(s: Any) -> Image:
    return Image.from_dict(s)


def image_to_dict(x: Image) -> Any:
    return to_class(Image, x)


def ingredient_item_from_dict(s: Any) -> IngredientItem:
    return IngredientItem.from_dict(s)


def ingredient_item_to_dict(x: IngredientItem) -> Any:
    return to_class(IngredientItem, x)


def ingredients_list_from_dict(s: Any) -> IngredientsList:
    return IngredientsList.from_dict(s)


def ingredients_list_to_dict(x: IngredientsList) -> Any:
    return to_class(IngredientsList, x)


def instruction_from_dict(s: Any) -> Instruction:
    return Instruction.from_dict(s)


def instruction_to_dict(x: Instruction) -> Any:
    return to_class(Instruction, x)


def range_from_dict(s: Any) -> Range:
    return Range.from_dict(s)


def range_to_dict(x: Range) -> Any:
    return to_class(Range, x)


def recipe_from_dict(s: Any) -> Recipe:
    return Recipe.from_dict(s)


def recipe_to_dict(x: Recipe) -> Any:
    return to_class(Recipe, x)


def serves_from_dict(s: Any) -> Serves:
    return Serves.from_dict(s)


def serves_to_dict(x: Serves) -> Any:
    return to_class(Serves, x)


def timing_from_dict(s: Any) -> Timing:
    return Timing.from_dict(s)


def timing_to_dict(x: Timing) -> Any:
    return to_class(Timing, x)
