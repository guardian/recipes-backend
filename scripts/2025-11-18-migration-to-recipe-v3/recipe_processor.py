import copy
import json
import logging
import os
from difflib import unified_diff
from queue import Queue
from time import sleep

from config import Config
from csv_state import Stage1Report, Stage1ReportStatus
from services import RecipeReference, fetch_CAPI_article, find_recipe_last_updated_at, fetch_flexible_article, \
  ArticleRecipeReferences, FlexibleError, ArticleRecipes
import uuid
import requests

logger = logging.getLogger(__name__)

def find_recipe_elements(article: ArticleRecipes, recipe_id: str) -> dict:
  for recipe in article.recipes:
    if 'id' in recipe and recipe['id'] == recipe_id:
      return recipe
  raise ValueError(f"Recipe ID {recipe_id} not found in article with composer ID {article.composer_id}")

def round_if_whole(number: float) -> float | int:
  if number.is_integer():
    return int(number)
  return number

def contains_digit(s: str) -> bool:
  return any(char.isdigit() for char in s)

def format_ingredient_text(ingredient: dict) -> str:
  parts: list[str] = []
  if 'amount' in ingredient and ingredient['amount'] is not None:
    amount = ingredient['amount']
    amount_str = ''
    if 'min' in amount and amount['min'] is not None:
      amount_str += str(round_if_whole(amount['min']))
      if 'max' in amount and amount['max'] is not None and amount['max'] != amount['min']:
        amount_str += f"-{round_if_whole(amount['max'])}"
      parts.append(amount_str + ' ')
    if 'unit' in ingredient and ingredient['unit'] is not None:
      parts.append(ingredient['unit'].strip() + ' ')
  else: # no amount
    # in the case we have no amount but a unit, and that unit contains a digit, we include it ("2cm ginger")
    if 'unit' in ingredient and ingredient['unit'] is not None and contains_digit(ingredient['unit']):
      parts.append(ingredient['unit'].strip() + ' ')
  if 'prefix' in ingredient and ingredient['prefix'] is not None:
    parts.append(ingredient['prefix'].strip() + ' ')
  if 'name' in ingredient and ingredient['name'] is not None:
    parts.append(ingredient['name'].strip().removesuffix(','))
  if 'suffix' in ingredient and ingredient['suffix'] is not None:
    parts.append(', ' + ingredient['suffix'].strip())
  return ''.join(parts).strip()


def update_model_to_pass_validation(recipe: dict) -> dict:
  new_recipe = copy.deepcopy(recipe)

  # These fields aren't touched by the templatizer, we won't keep the value returned by the templatizer
  new_recipe['contributors'] = []
  new_recipe['featuredImage'] = None
  new_recipe['serves'] = []
  new_recipe['timings'] = []
  new_recipe['isAppReady'] = new_recipe['isAppReady'] if 'isAppReady' in new_recipe else True
  new_recipe['celebrationIds'] = new_recipe['celebrationIds'] if 'celebrationIds' in new_recipe else []


  # Filter empty ingredient groups
  if 'ingredients' in new_recipe:
    new_recipe['ingredients'] = [group for group in new_recipe['ingredients'] if 'ingredientsList' in group and group['ingredientsList']]

  # Filter ingredients: set amount to null if amount.min is null
  if 'ingredients' in new_recipe:
    for ingredient_group in new_recipe['ingredients']:
      if 'ingredientsList' in ingredient_group:
        for ingredient in ingredient_group['ingredientsList']:
          if 'amount' in ingredient and ingredient['amount'] is not None:
            if 'min' not in ingredient['amount'] or ingredient['amount']['min'] is None:
              ingredient['amount'] = None
          ingredient['text'] = format_ingredient_text(ingredient)
          if not 'ingredientID' in ingredient or ingredient['ingredientID'] is None:
            ingredient['ingredientID'] = str(uuid.uuid4())

  # Force numbering instruction entries
  if 'instructions' in new_recipe:
    numbered_instructions = []
    for idx, instruction in enumerate(new_recipe['instructions']):
      instruction['stepNumber'] = idx + 1
      numbered_instructions.append(instruction)
    new_recipe['instructions'] = numbered_instructions


  return new_recipe

def templatise_recipe(recipe: dict, config: Config) -> dict:
  headers = {
    'content-type': 'application/json',
    'accept': 'application/json',
    'authorization': f'Bearer {config.templatiser_token}'
  }
  response = requests.post(config.templatiser_url, data=json.dumps(recipe), headers=headers)
  if response.status_code == 422:
    logger.error(f"Validation error: {response.text}")
    logger.error(json.dumps(recipe, indent=2))
  if response.status_code == 503:
    logger.warning("Service unavailable, sleeping for 10 seconds and retrying...")
    sleep(10)
    return templatise_recipe(recipe, config)
  response.raise_for_status()
  return response.json()

def reassemble_recipe(recipe: dict, templatised: dict) -> dict:
  new_recipe = copy.deepcopy(recipe)

  new_recipe['ingredients'] = templatised['ingredients']
  new_recipe['instructions'] = templatised['instructions']
  return new_recipe

def compute_diff(template_result: dict) -> str | None:
  if 'expected' in template_result and template_result['expected'] is not None:
    expected = json.dumps(template_result['expected'], indent=2)
    received = json.dumps(template_result['received'], indent=2)

    # diff the two
    diff = unified_diff(
      expected.splitlines(keepends=True),
      received.splitlines(keepends=True),
      fromfile='expected',
      tofile='received'
    )
    return ''.join(diff)
  return None

def process_article(
  result_queue: Queue[Stage1Report | None],
  config: Config,
  article_recipe_references: ArticleRecipeReferences,
  output_folder: str,
) -> list[Stage1Report]:
  logger.info(f"Processing CAPI article: {article_recipe_references.capi_id}")

  # Fetch article in CAPI to get the composer id
  capi_fetch_response = fetch_CAPI_article(article_recipe_references.capi_id, config)
  if capi_fetch_response is None:
    logger.warning(f"Article {article_recipe_references.capi_id} not found in CAPI")
    reports = [Stage1Report.error(recipe_id, article_recipe_references.capi_id, "CAPI article not found") for recipe_id in article_recipe_references.recipe_ids]
    for report in reports:
      result_queue.put(report)
    return reports

  # fetch the recipes from composer (flexible)
  composer_id = capi_fetch_response["response"]["content"]["fields"].get("internalComposerCode") if capi_fetch_response is not None else None
  flexible_article = fetch_flexible_article(composer_id, config)

  # check for FlexibleError
  if isinstance(flexible_article, FlexibleError):
    logger.error(f"Error fetching flexible article for composer ID {composer_id}: {flexible_article.error_message}")
    reports = [Stage1Report.error(recipe_id, article_recipe_references.capi_id, flexible_article.error_message) for recipe_id in article_recipe_references.recipe_ids]
    for report in reports:
      result_queue.put(report)
    return reports

  reports: list[Stage1Report] = []
  # for each recipe
  for recipe_id in article_recipe_references.recipe_ids:

    capi_recipe = find_recipe_elements(flexible_article, recipe_id)
    massaged_recipe = update_model_to_pass_validation(capi_recipe)
    template_result = templatise_recipe(massaged_recipe, config)
    result = reassemble_recipe(capi_recipe, template_result['recipe'])

    # write the json file
    filename = os.path.join(output_folder, f"{recipe_id}.json")
    with open(filename, 'w') as f:
      json.dump(result, f, indent=2)

    if template_result['reviewReason'] is not None:
      status = Stage1ReportStatus.REVIEW_NEEDED
    elif template_result['expected'] is not None:
      status = Stage1ReportStatus.ACCEPTED_BY_LLM
    else:
      status = Stage1ReportStatus.SUCCESS

    report = Stage1Report(
      recipe_id=recipe_id,
      capi_id=article_recipe_references.capi_id,
      composer_id=composer_id,
      filename=filename,
      status=status,
      reason=template_result['reviewReason'],
      diff=compute_diff(template_result),
      expected=template_result['expected'],
      received=template_result['received'],
      cost=template_result['cost'],
      revision=flexible_article.revision,
    )
    reports.append(report)
    result_queue.put(report)
    logger.info(f"Completed recipe_id={recipe_id} with status={status}")
  return reports

def process_recipe_with_error_handling(
  result_queue: Queue[Stage1Report | None],
  config: Config,
  article_recipe_references: ArticleRecipeReferences,
  output_folder: str,
) -> list[Stage1Report]:
  try:
    return process_article(result_queue, config, article_recipe_references, output_folder)
  except Exception as e:
    logger.error(f"Error processing capi article capi_id={article_recipe_references.capi_id}: {e}")
    import traceback
    logger.error(traceback.format_exc())
    reports = [Stage1Report.error(recipe_id, article_recipe_references.capi_id, str(e)) for recipe_id in article_recipe_references.recipe_ids]
    for report in reports:
      result_queue.put(report)
    return reports
