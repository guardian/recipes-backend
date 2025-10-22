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
def main():
  recipes = fetch_index()
  for recipe in recipes[:10]:
    print(recipe['recipeUID'])
    capi_id = recipe['capiArticleId']
    response = fetch_CAPI_article(capi_id)
    recipe = find_recipe_elements(response["response"], recipe['recipeUID'])
    print(recipe)


if __name__ == "__main__":
  main()
