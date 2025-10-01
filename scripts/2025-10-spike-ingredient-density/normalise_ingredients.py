import logging
import sqlite3
import json
from sqlite3 import Connection
from textwrap import dedent

from llm import LLMClient

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def select_next_batch(conn: Connection, batch_size=100) -> list[dict]:
  query = dedent(f"""
    select ingredient.ingredient_id, name, suffix, prefix
    from ingredient
    where lower(trim(ingredient.unit)) in ('g', 'kg')
    group by concat(prefix, name, suffix)
    order by 1 desc
    limit :batch_size;
  """)
  # Execute the SELECT query.
  cursor = conn.execute(query, {'batch_size': batch_size})
  # Convert the resulting rows into a list of dictionaries for serialization.
  rows = [dict(row) for row in cursor.fetchall()]
  return rows

def build_prompt(ingredients: list[dict]) -> str:
  prompt = dedent("""
    We're trying to facilitate unit conversion in our database of recipes. For each ingredient I'll give you, I want you to normalise it to its simplest form, such that we can identify which density we need to gather.
    The normalised name should preserve the way the ingredient is shaped or cut as this has an impact on density, though there is no need to be extremely precise. "finely chopped" and "chopped" can be treated the same, for instance.
    For instance:
      - ripe mangoes -> mango
      - 1 garlic clove, peeled and finely chopped -> chopped garlic
      - 200g cherry tomatoes, halved -> cherry tomatoes
      - 1 small red onion, finely chopped -> chopped red onion
      - Leftover potato skins, ideally with a little flesh still left on – aim for 1-2 skins per person -> potato skins
      - plain flour -> plain flour

    You'll receive a batch of ingredients, each with an id, a name, a prefix and a suffix.
    You'll respond with a JSON array of objects, each with the following fields:
      - ingredient_id: the id of the ingredient
      - normalised_name: the normalised name of the ingredient, in lowercase, singular if possible
  """)

  # dump the ingredient as a json array
  rendered_ingredient = json.dumps(ingredients)
  prompt += f"\nHere are the ingredients:\n{rendered_ingredient}\n"
  return prompt


def main():
  conn = sqlite3.connect('recipes.db', check_same_thread=False, uri=True)
  conn.row_factory = sqlite3.Row

  llm_client = LLMClient()

  batch = select_next_batch(conn, batch_size=3)
  print(batch)
  logging.info(f"Selected {len(batch)} ingredients for normalization.")

  prompt = build_prompt(batch)
  result = llm_client.call_llm(prompt)
  logging.debug(f"LLM response: {result}")
  result = result.replace("```json", "").replace("```", "")
  print(result)

  for normalised in json.loads(result):
    conn.execute("""
      update ingredient
      set density_ingredient = :density_ingredient
      where ingredient_id = :ingredient_id
    """, {
      'density_ingredient': normalised['normalised_name'],
      'ingredient_id': normalised['ingredient_id']
    })
  conn.commit()

if __name__ == "__main__":
  main()
