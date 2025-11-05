import csv
from argparse import ArgumentParser
from datetime import datetime
import difflib
import json
import os
from dataclasses import dataclass
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


def fetch_CAPI_article(capi_id: str) -> dict | None:
  # url = f'https://content.guardianapis.com/channel/feast/item/{capi_id}?api-key={CAPI_KEY}&show-fields=all&show-blocks=all'
  url = f'https://content.guardianapis.com/{capi_id}?api-key={CAPI_KEY}&show-fields=all&show-blocks=all'
  print(f"Fetching CAPI article: {url}")
  response = requests.get(url)
  if response.status_code == 404:
    print(f"Article {capi_id} not found in CAPI")
    return None
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
  if response.status_code == 503:
    print("Service unavailable, sleeping for 10 seconds and retrying...")
    sleep(10)
    return templatise_recipe(recipe)
  response.raise_for_status()
  return response.json()


def format_ingredient_text(ingredient: dict) -> str:
  parts = ['<strong>']
  if 'amount' in ingredient and ingredient['amount'] is not None:
    amount = ingredient['amount']
    amount_str = ''
    if 'min' in amount and amount['min'] is not None:
      amount_str += str(amount['min'])
      if 'max' in amount and amount['max'] is not None and amount['max'] != amount['min']:
        amount_str += f"-{amount['max']}"
      parts.append(amount_str + ' ')
  if 'unit' in ingredient and ingredient['unit'] is not None:
    parts.append(ingredient['unit'].strip() + ' ')
  if 'prefix' in ingredient and ingredient['prefix'] is not None:
    parts.append(ingredient['prefix'].strip() + ' ')
  if 'name' in ingredient and ingredient['name'] is not None:
    parts.append(ingredient['name'].strip())
  parts.append('</strong>')
  if 'suffix' in ingredient and ingredient['suffix'] is not None:
    parts.append(' ' + ingredient['suffix'].strip())
  return ''.join(parts).strip()

def update_model_to_pass_validation(recipe: dict) -> dict:
  # Set bookCredit and difficultyLevel to null
  recipe['bookCredit'] = None
  recipe['difficultyLevel'] = None

  recipe['contributors'] = [contributor.get("tagId") or contributor.get("text") for contributor in recipe['contributors']]

  # Set featuredImage.imageType to "Photograph"
  if 'featuredImage' in recipe:
    recipe['featuredImage']['imageType'] = 'Photograph'

  # Filter empty ingredient groups
  if 'ingredients' in recipe:
    recipe['ingredients'] = [group for group in recipe['ingredients'] if 'ingredientsList' in group and group['ingredientsList']]

  # Filter ingredients: set amount to null if amount.min is null
  if 'ingredients' in recipe:
    for ingredient_group in recipe['ingredients']:
      if 'ingredientsList' in ingredient_group:
        for ingredient in ingredient_group['ingredientsList']:
          if 'amount' in ingredient and ingredient['amount'] is not None:
            if 'min' not in ingredient['amount'] or ingredient['amount']['min'] is None:
              ingredient['amount'] = None
          ingredient['text'] = format_ingredient_text(ingredient)

  # Force numbering instruction entries
  if 'instructions' in recipe:
    numbered_instructions = []
    for idx, instruction in enumerate(recipe['instructions']):
      instruction['stepNumber'] = idx + 1
      numbered_instructions.append(instruction)
    recipe['instructions'] = numbered_instructions

  if 'serves' in recipe and recipe['serves']:
    for serves in recipe['serves']:
      if 'text' not in serves:
        text = "serves "
        if 'min' in recipe['serves'] and recipe['serves']['min'] is not None:
          text += str(recipe['serves']['min'])
        if 'max' in recipe['serves'] and recipe['serves']['max'] is not None:
          text += f"-{recipe['serves']['max']}"
        if 'unit' in recipe['serves'] and recipe['serves']['unit'] is not None:
          text += f" {recipe['serves']['unit']}"
        serves['text'] = text
      if 'unit' not in serves:
        serves['unit'] = "people"

  if 'timings' in recipe:
    # only keep the timings that have text
    recipe['timings'] = [ timing for timing in recipe['timings'] if 'text' in timing ]

  return recipe

def load_already_processed_checksums(csv_file: str) -> set[str]:
  processed_checksums = set()
  try:
    with open(csv_file) as csv_file:
      reader = csv.DictReader(csv_file)
      for row in reader:
        processed_checksums.add(row['hash'])
  except FileNotFoundError:
    pass
  return processed_checksums

@dataclass(frozen=True)
class ProcessingResult:
  id: str
  hash: str
  valid: bool
  cost: float
  reviewReason: str | None
  diff: str | None
  expected: dict | None
  received: dict | None

def append_result_to_csv(result: ProcessingResult, file: str):
  file_exists = os.path.isfile(file)
  with open(file, 'a', newline='') as csvfile:
    fieldnames = ['id', 'hash', 'valid', 'cost', 'reviewReason', 'diff', 'expected', 'received']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    if not file_exists:
      writer.writeheader()
    writer.writerow({
      'id': result.id,
      'hash': result.hash,
      'valid': result.valid,
      'cost': f"{result.cost:.3f}",
      'reviewReason': result.reviewReason or '',
      'diff': result.diff or '',
      'expected': json.dumps(result.expected) if result.expected else '',
      'received': json.dumps(result.received) if result.received else '',
    })
    csvfile.flush()

def main(csv_file_name: str | None) -> None:

  if not csv_file_name:
    timestamp = datetime.now().strftime('%Y-%m-%dT%H-%M-%S')
    csv_file_name = f"output/processing-results-{timestamp}.csv"

  processed_checksums = load_already_processed_checksums(csv_file_name)

  total_cost = 0.0
  total_recipes = 0

  recipes = fetch_index()
  for recipe in recipes[:200]:
    print("\n\n-------------------------")

    if recipe['checksum'] in processed_checksums:
      print(f"Skipping already processed recipe {recipe['recipeUID']} with checksum {recipe['checksum']}")
      continue

    print(f"Processing {recipe['recipeUID']} with checksum {recipe['checksum']}")
    capi_id = recipe['capiArticleId']
    response = fetch_CAPI_article(capi_id)
    if not response:
      print(f"Skipping recipe {recipe['recipeUID']} as CAPI article {capi_id} not found")
      continue
    capi_recipe = find_recipe_elements(response["response"], recipe['recipeUID'])
    massaged_recipe = update_model_to_pass_validation(capi_recipe)
    template = templatise_recipe(massaged_recipe)
    with open(f"output/recipes/{recipe['recipeUID']}.json", 'w') as f:
      json.dump(template['recipe'], f, indent=2)

    print(f"Recipe {recipe['recipeUID']}, hash {recipe['checksum']} was processed (${template['cost']:.3f}). Valid: {template["valid"]}")
    if template["reviewReason"]:
      print(f"Recipe {recipe['recipeUID']} needs human review. Reason: {template['reviewReason']}")

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
      if 'expected' in template and template['expected'] is not None:
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

    total_cost += template['cost'] if template['cost'] else 0.0
    total_recipes += 1

    print(f"Average cost so far for {total_recipes} recipes: ${total_cost/total_recipes:.3f}, Total cost: ${total_cost:.3f}")

    result = ProcessingResult(
      id=recipe['recipeUID'],
      hash=recipe['checksum'],
      valid=template['valid'],
      cost=template['cost'],
      reviewReason=template['reviewReason'],
      diff=''.join(difflib.unified_diff(
        json.dumps(template['expected'], indent=2).splitlines(keepends=True) if template.get('expected') else [],
        json.dumps(template['received'], indent=2).splitlines(keepends=True) if template.get('received') else [],
        fromfile='expected',
        tofile='received'
      )) if template.get('expected') and template.get('received') else None,
      expected=template.get('expected'),
      received=template.get('received'),
    )
    append_result_to_csv(result, csv_file_name)


  print(f"Total cost for {total_recipes} recipes: ${total_cost:.9f}")


if __name__ == "__main__":
  arg_parser = ArgumentParser(description='Process recipe templates and log results.')
  arg_parser.add_argument('-c', '--csv-file-name', type=str, default=None, help='CSV file name to log results')
  args = arg_parser.parse_args()

  main(args.csv_file_name)
