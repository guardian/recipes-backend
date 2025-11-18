from dataclasses import dataclass
import requests

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
