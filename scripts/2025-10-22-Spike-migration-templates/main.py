import difflib
import json
import os
from time import sleep
from dotenv import load_dotenv

import requests


load_dotenv()
CAPI_KEY = os.getenv('CAPI_KEY')

def fetch_index() -> list[dict]:
  response = requests.get('https://recipes.guardianapis.com/v2/index.json')
  response.raise_for_status()
  recipes = response.json()["recipes"]
  return recipes


def fetch_CAPI_article(capi_id: str) -> dict:
  url = f'https://content.guardianapis.com/channel/feast/item/{capi_id}?api-key={CAPI_KEY}&show-fields=all&show-blocks=all'
  print(f"Fetching CAPI article: {url}")
  response = requests.get(url)
  response.raise_for_status()
  return response.json()


def find_recipe_elements(article: dict, recipe_id: str) -> dict:
  blocks: dict = article["content"]["blocks"]
  if "body" in blocks:
    body_blocks = blocks["body"]
    for block in body_blocks:
      if "elements" in block:
        for element in block["elements"]:
          if "type" in element and element["type"] == "recipe":
            json_value = json.loads(element["recipeTypeData"]["recipeJson"])
            if json_value["id"] == recipe_id:
              return json_value
  raise Exception(f"No recipe element found for recipe ID {recipe_id}")


def templatise_recipe(recipe: dict) -> dict:
  url = 'http://localhost:8000/api/v1/templatise'
  cookies = {'gutoolsAuth-assym': os.getenv('STRUCTURISER_TOKEN')}
  headers = {'content-type': 'application/json'}
  response = requests.post(url, data=json.dumps(recipe), headers=headers, cookies=cookies)
  if response.status_code == 422:
    print(f"Validation error: {response.text}")
    print(json.dumps(recipe, indent=2))
  response.raise_for_status()
  return response.json()


def format_ingredient_text(ingredient: dict) -> str:
  parts = []
  if 'amount' in ingredient and ingredient['amount'] is not None:
    amount = ingredient['amount']
    if 'min' in amount and amount['min'] is not None:
      parts.append(str(amount['min']))
      if 'max' in amount and amount['max'] is not None and amount['max'] != amount['min']:
        parts.append(f"-{amount['max']}")
  if 'unit' in ingredient and ingredient['unit'] is not None:
    parts.append(ingredient['unit'])
  if 'prefix' in ingredient and ingredient['prefix'] is not None:
    parts.append(ingredient['prefix'])
  if 'name' in ingredient and ingredient['name'] is not None:
    parts.append(ingredient['name'])
  if 'suffix' in ingredient and ingredient['suffix'] is not None:
    parts.append(ingredient['suffix'])
  return ' '.join(parts)

def update_model_to_pass_validation(recipe: dict) -> dict:
  # Set bookCredit and difficultyLevel to null
  recipe['bookCredit'] = None
  recipe['difficultyLevel'] = None

  recipe['contributors'] = [contributor.get("tagId") or contributor.get("text") for contributor in recipe['contributors']]

  # Set featuredImage.imageType to "Photograph"
  if 'featuredImage' in recipe:
    recipe['featuredImage']['imageType'] = 'Photograph'

  # Filter ingredients: set amount to null if amount.min is null
  if 'ingredients' in recipe:
    for ingredient_group in recipe['ingredients']:
      if 'ingredientsList' in ingredient_group:
        for ingredient in ingredient_group['ingredientsList']:
          if 'amount' in ingredient and ingredient['amount'] is not None:
            if 'min' not in ingredient['amount'] or ingredient['amount']['min'] is None:
              ingredient['amount'] = None
          if 'text' not in ingredient:
            ingredient['text'] = format_ingredient_text(ingredient)

  # Force numbering instruction entries
  if 'instructions' in recipe:
    numbered_instructions = []
    for idx, instruction in enumerate(recipe['instructions']):
      instruction['stepNumber'] = idx + 1
      numbered_instructions.append(instruction)
    recipe['instructions'] = numbered_instructions

  return recipe

def load_already_processed_checksums() -> set[str]:
  processed_checksums = set()
  try:
    with open('processed_checksums.txt', 'r') as f:
      for line in f:
        processed_checksums.add(line.strip())
  except FileNotFoundError:
    pass
  return processed_checksums

def append_processed_checksum(checksum: str):
  with open('processed_checksums.txt', 'a') as f:
    f.write(f"{checksum}\n")
    f.flush()

def main():

  processed_checksums = load_already_processed_checksums()

  recipes = fetch_index()
  for recipe in recipes[:20]:
    print("\n\n-------------------------")

    if recipe['checksum'] in processed_checksums:
      print(f"Skipping already processed recipe {recipe['recipeUID']} with checksum {recipe['checksum']}")
      continue

    print(f"Processing {recipe['recipeUID']} with checksum {recipe['checksum']}")
    capi_id = recipe['capiArticleId']
    response = fetch_CAPI_article(capi_id)
    capi_recipe = find_recipe_elements(response["response"], recipe['recipeUID'])
    massaged_recipe = update_model_to_pass_validation(capi_recipe)
    template = templatise_recipe(massaged_recipe)
    print(f"Recipe {recipe['recipeUID']}, hash {recipe['checksum']} is valid: {template["valid"]}")

    if not template["valid"]:
      print(f"https://recipes.guardianapis.com/content/{recipe['checksum']}")
      print(json.dumps(template, indent=2))
      expected = json.dumps(template['expected'], indent=2)
      received = json.dumps(template['received'], indent=2)

      # diff the two
      diff = difflib.unified_diff(
        expected.splitlines(keepends=True),
        received.splitlines(keepends=True),
        fromfile='expected',
        tofile='received'
      )
      print(''.join(diff))
    else:
      append_processed_checksum(recipe['checksum'])


if __name__ == "__main__":
  main()
