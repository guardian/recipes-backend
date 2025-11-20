import json
from dataclasses import dataclass
import requests

from config import Config


@dataclass(frozen=True)
class RecipeReference:
  recipe_id: str
  capi_id: str

@dataclass(frozen=True)
class ArticleRecipeReferences:
  capi_id: str
  recipe_ids: list[str]

def fetch_index() -> list[RecipeReference]:
  response = requests.get('https://recipes.guardianapis.com/v2/index.json')
  response.raise_for_status()
  recipes = response.json()["recipes"]
  recipes = [RecipeReference(recipe_id=recipe["recipeUID"], capi_id=recipe["capiArticleId"]) for recipe in recipes]
  return recipes

def fetch_CAPI_article(capi_id: str, config: Config) -> dict | None:
  url = f'{config.capi_url}{capi_id}?api-key={config.capi_key}&show-fields=all&show-blocks=all'
  response = requests.get(url)
  if response.status_code == 404:
    return None
  response.raise_for_status()
  return response.json()

@dataclass(frozen=True)
class ArticleRecipes:
  composer_id: str
  revision: int
  recipes: list[dict]

@dataclass(frozen=True)
class FlexibleError:
  composer_id: str
  error_message: str

def fetch_flexible_article(composer_id: str, config: Config) -> ArticleRecipes | FlexibleError | None:
  print(f"Fetching recipes for composer ID {composer_id}")

  headers = {
    "accept": "application/json",
  }

  print(f"{config.integration_read_url}set-recipe-elements/{composer_id}")

  response = requests.get(
    url=f"{config.integration_read_url}set-recipe-elements/{composer_id}",
    headers=headers,
    verify=config.ca_bundle_path,
  )

  if response.status_code == 200:
    body = response.json()

    recipes_raw_json = []
    for block in body["live"]["blocks"]:
      for element in block.get("elements", []):
        if element["elementType"] == "recipe":
          recipes_raw_json.append(element)
    recipes = [json.loads(block["fields"]["recipeJson"]) for block in recipes_raw_json]

    return ArticleRecipes(
      composer_id=composer_id,
      revision=int(body["live"]["contentChangeDetails"]["revision"]),
      recipes=recipes
    )
  else:
    return FlexibleError(
      composer_id=composer_id,
      error_message=f"Failed to fetch flexible article: {response.status_code} {response.text}"
    )


def find_recipe_last_updated_at(article: dict, article_id: str) -> str:
  if "content" in article and "fields" in article["content"] and "lastModified" in article["content"]["fields"]:
    return article["content"]["fields"]["lastModified"]
  else:
    raise Exception(f"No recipe lastModified date found for article ID {article_id}")
