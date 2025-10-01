from pydantic import BaseModel
from typing import Optional, List, Any


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


class RangeClass(BaseModel):
  """A numeric range with minimum and maximum values"""

  max: Optional[float] = None
  """The maximum value of the range"""

  min: Optional[float] = None
  """The minimum value of the range"""


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
  suffix: Optional[str] = None
  text: Optional[str] = None
  """Full text representation of the ingredient"""

  unit: Optional[str] = None
  """Unit of measurement for the ingredient"""


class IngredientsListIngredientsList(BaseModel):
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
  suffix: Optional[str] = None
  text: Optional[str] = None
  """Full text representation of the ingredient"""

  unit: Optional[str] = None
  """Unit of measurement for the ingredient"""


class IngredientsList(BaseModel):
  """A section of ingredients with an optional section name"""

  ingredients_list: Optional[List[IngredientsListIngredientsList]] = None
  """List of ingredients in this section"""

  recipe_section: Optional[str] = None
  """Name of the recipe section (e.g., 'For the sauce', 'For the garnish')"""


class IngredientsTemplateListIngredientsList(BaseModel):
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
  suffix: Optional[str] = None
  text: Optional[str] = None
  """Full text representation of the ingredient"""

  unit: Optional[str] = None
  """Unit of measurement for the ingredient"""

  template: Optional[str] = None


class IngredientsTemplateList(BaseModel):
  """A section of ingredients with an optional section name"""

  ingredients_list: Optional[List[IngredientsTemplateListIngredientsList]] = None
  """List of ingredients in this section"""

  recipe_section: Optional[str] = None
  """Name of the recipe section (e.g., 'For the sauce', 'For the garnish')"""


class InstructionTemplate(BaseModel):
  """A single cooking instruction step with optional images"""

  description: Any
  description_template: Optional[str] = None
  """Detailed description of the cooking step"""

  images: Optional[List[str]] = None
  """Array of image URLs or identifiers for this step"""

  step_number: Optional[float] = None
  """The sequential number of this instruction step"""


class Instruction(BaseModel):
  """A single cooking instruction step with optional images"""

  description: str
  """Detailed description of the cooking step"""

  images: Optional[List[str]] = None
  """Array of image URLs or identifiers for this step"""

  step_number: Optional[float] = None
  """The sequential number of this instruction step"""


class Range(BaseModel):
  """A numeric range with minimum and maximum values"""

  max: Optional[float] = None
  """The maximum value of the range"""

  min: Optional[float] = None
  """The minimum value of the range"""


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


class IngredientElement(BaseModel):
  """A section of ingredients with an optional section name"""

  ingredients_list: Optional[List[IngredientsListIngredientsList]] = None
  """List of ingredients in this section"""

  recipe_section: Optional[str] = None
  """Name of the recipe section (e.g., 'For the sauce', 'For the garnish')"""


class InstructionElement(BaseModel):
  """A single cooking instruction step with optional images"""

  description: str
  """Detailed description of the cooking step"""

  images: Optional[List[str]] = None
  """Array of image URLs or identifiers for this step"""

  step_number: Optional[float] = None
  """The sequential number of this instruction step"""


class ServeElement(BaseModel):
  """Information about how many servings the recipe makes"""

  unit: str
  """Unit for the serving amount (e.g., 'people', 'portions')"""

  amount: Optional[RangeClass] = None
  """Number of servings as a range or null"""

  text: Optional[str] = None
  """Human-readable text representation of the serving information"""


class TimingElement(BaseModel):
  """Timing information for recipe preparation or cooking"""

  duration_in_mins: Optional[RangeClass] = None
  """Duration in minutes as a range or null"""

  qualifier: Optional[str] = None
  """Type of timing (e.g., 'prep time', 'cook time', 'total time')"""

  text: Optional[str] = None
  """Human-readable text representation of the timing"""


class RecipeV2(BaseModel):
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


class IngredientsTemplateIngredientsList(BaseModel):
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
  suffix: Optional[str] = None
  text: Optional[str] = None
  """Full text representation of the ingredient"""

  unit: Optional[str] = None
  """Unit of measurement for the ingredient"""

  template: Optional[str] = None


class IngredientsTemplateElement(BaseModel):
  """A section of ingredients with an optional section name"""

  ingredients_list: Optional[List[IngredientsTemplateIngredientsList]] = None
  """List of ingredients in this section"""

  recipe_section: Optional[str] = None
  """Name of the recipe section (e.g., 'For the sauce', 'For the garnish')"""


class InstructionsTemplateElement(BaseModel):
  """A single cooking instruction step with optional images"""

  description: Any
  description_template: Optional[str] = None
  """Detailed description of the cooking step"""

  images: Optional[List[str]] = None
  """Array of image URLs or identifiers for this step"""

  step_number: Optional[float] = None
  """The sequential number of this instruction step"""


class RecipeV3(BaseModel):
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

  ingredients_template: Optional[List[IngredientsTemplateElement]] = None
  """Ingredients organized by sections using string templates"""

  instructions: Optional[List[InstructionElement]] = None
  """Step-by-step cooking instructions"""

  instructions_template: Optional[List[InstructionsTemplateElement]] = None
  """Step-by-step cooking instructions using string templates"""

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


class Serves(BaseModel):
  """Information about how many servings the recipe makes"""

  unit: str
  """Unit for the serving amount (e.g., 'people', 'portions')"""

  amount: Optional[RangeClass] = None
  """Number of servings as a range or null"""

  text: Optional[str] = None
  """Human-readable text representation of the serving information"""


class Timing(BaseModel):
  """Timing information for recipe preparation or cooking"""

  duration_in_mins: Optional[RangeClass] = None
  """Duration in minutes as a range or null"""

  qualifier: Optional[str] = None
  """Type of timing (e.g., 'prep time', 'cook time', 'total time')"""

  text: Optional[str] = None
  """Human-readable text representation of the timing"""
