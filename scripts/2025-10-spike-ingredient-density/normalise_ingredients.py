import json
import logging
from textwrap import dedent
from pydantic import BaseModel

from llm import LLMClient


def build_prompt(ingredients: list[dict]) -> str:
  prompt = dedent("""
    We're trying to facilitate unit conversion in our database of recipes. For each ingredient I'll give you, I want you to normalise it to its simplest form, such that we can identify which density we need to gather.

    ## Normalisation
    The normalised name should preserve the way the ingredient is shaped or cut as this has an impact on density, though there is no need to be extremely precise. "finely chopped" and "chopped" can be treated the same, for instance.
    Sliced, diced, chopped are all useful descriptors to keep.
    We don't keep the colour of the ingredient in its normalised name unless it has an effect on density. So red or green pepper => don't care, just keep "bell pepper", but green lentil vs coral lentil matters.
    You will normalise any tinned ingredient as "tin" as we won't convert these ingredients.
    The normalised form will be as short as possible, always using the british spelling, lower case, no accent and singular.
    For instance:
      - ripe mangoes -> mango
      - 1 garlic clove, peeled and finely chopped -> chopped garlic
      - 200g cherry tomatoes, halved -> cherry tomato
      - 1 small red onion, finely chopped -> chopped onion
      - Leftover potato skins, ideally with a little flesh still left on – aim for 1-2 skins per person -> potato skin
      - plain flour -> plain flour
      - small leeks -> leek
      - stalks, seeds and pith removed and discarded, flesh thinly sliced yellow pepper -> sliced pepper
      - brown and/or puy lentils -> brown lentil
      - thinly sliced in cross-section circles (we use a mandolin) red onion -> sliced onion
      - tinned peaches in syrup -> tin
      - unsalted butter -> butter
      - chopped floury potato -> chopped potato
      - chopped new potato -> chopped potato
      - chopped large zucchini -> chopped courgette
      - cooked potato -> potato
      - cubed potato -> diced potato
      - sliced maris piper potato -> sliced potato
      - sliced salad onion -> sliced spring onion
      - sumac onion -> onion
      - julienned spring onion -> sliced spring onion
      - baby onion -> onion
      - pink peppercorns -> peppercorn
      - 00 pasta flour or tipo 00 flour -> 00 flour
      - flaked almonds -> flaked almond
      - Natural yogurt -> yoghurt
      - sea salt flakes -> salt
      - all purpose flour -> plain flour
      - almond meal -> ground almond
      - slivered almond -> flaked almond
      - wasabi paste -> wasabi
      - basmati rice -> long grain rice
      - creme fraiche -> sour cream
      - soured cream -> sour cream

    ## raw ingredient
      - sour cream => cream
      - egg yolk => egg
      - sumac onion => onion
      - 1 garlic clove => garlic
      - 1 garlic bulb thinly sliced => garlic
      - grated carrot => carrot

    ## US Customary or not
    You'll also need to decide whether the ingredient is typically expressed in cups or tbsp in the US.
    The general rule to apply is: if it's a dry ingredient that can be scooped into a cup or tablespoon, then yes.
    Otherwise it depends on its preparation state, or its consistency (liquid, paste, yoghurt etc).

    For instance Flour, sugar, oats, rice, yoghurt, cream, jam, chutney or jelly are all typically expressed in cups.
    However Butter, fish, meat, herbs (dill, parsley, coriander etc) and spices and pasta are not.

    Carrots or almonds won't be expressed in cups, but grated carrot or sliced almonds should be.
    Same for chopped, sliced, diced, shredded, crushed, minced vegetables and nuts etc: customary system.

    ## Format
    You'll receive a batch of ingredients, each with an id, a name, a prefix and a suffix.
    You'll respond by calling the tool `normalise_ingredient_batch` with a JSON array of objects, each with the following fields:
      - ingredient_id: the id of the ingredient
      - normalised_name: the normalised name of the ingredient
      - us_customary: true if the ingredient is typically expressed in cups / tbsp in the US, false otherwise
      - raw_ingredient: the essence of the ingredient. "egg", "flour", "carrot", regardless of preparation state.
  """)

  # dump the ingredient as a json array
  rendered_ingredient = json.dumps(ingredients)
  prompt += f"\nHere are the ingredients:\n{rendered_ingredient}\n"
  return prompt

class NormalisedIngredient(BaseModel):
  ingredient_id: int
  normalised_name: str
  us_customary: bool
  raw_ingredient: str

class NormalisedIngredientBatch(BaseModel):
  batch: list[NormalisedIngredient]

schema = NormalisedIngredientBatch.model_json_schema()

tool = {
  "name": "normalise_ingredient_batch",
  "description": "Record the normalised form of a batch of ingredients",
  "input_schema": schema
}

def process_llm_batch(ingredients: list[dict], llm_client: LLMClient) -> list[NormalisedIngredient]:
  """Process a batch of ingredients through LLM and return normalized results"""
  if not ingredients:
    return []

  prompt = build_prompt(ingredients)
  result = llm_client.call_llm(prompt, tool=tool)
  marshalled_batch = NormalisedIngredientBatch.model_validate(result)
  logging.debug(f"LLM response for batch of {len(ingredients)}: {marshalled_batch}")

  return marshalled_batch.batch
