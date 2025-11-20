from dataclasses import dataclass
import requests

from config import Config


@dataclass(frozen=True)
class RecipeReference:
  recipe_id: str
  capi_id: str

def fetch_index() -> list[RecipeReference]:
  response = requests.get('https://recipes.guardianapis.com/v2/index.json')
  response.raise_for_status()
  recipes = response.json()["recipes"]
  recipes = [RecipeReference(recipe_id=recipe["recipeUID"], capi_id=recipe["capiArticleId"]) for recipe in recipes]
  return recipes

def fetch_CAPI_article(capi_id: str, config: Config) -> dict | None:
  url = f'https://content.guardianapis.com/{capi_id}?api-key={config.capi_key}&show-fields=all&show-blocks=all'
  response = requests.get(url)
  if response.status_code == 404:
    return None
  response.raise_for_status()
  return response.json()

def find_recipe_last_updated_at(article: dict, article_id: str) -> str:
  if "content" in article and "fields" in article["content"] and "lastModified" in article["content"]["fields"]:
    return article["content"]["fields"]["lastModified"]
  else:
    raise Exception(f"No recipe lastModified date found for article ID {article_id}")
