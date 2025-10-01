import logging
import sqlite3
import json
from sqlite3 import Connection
from textwrap import dedent
from concurrent.futures import ThreadPoolExecutor, as_completed

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

def process_llm_batch(ingredients: list[dict], llm_client: LLMClient) -> list[dict]:
  """Process a batch of ingredients through LLM and return normalized results"""
  if not ingredients:
    return []

  prompt = build_prompt(ingredients)
  result = llm_client.call_llm(prompt)
  logging.debug(f"LLM response for batch of {len(ingredients)}: {result}")
  result = result.replace("```json", "").replace("```", "")

  return json.loads(result)

def process_multiple_batches(conn: Connection, llm_client: LLMClient, batch_size=100, parallel_batches=4) -> bool:
  # Fetch a large batch of ingredients
  large_batch = select_next_batch(conn, batch_size=batch_size*parallel_batches)
  logging.info(f"Selected {len(large_batch)} ingredients for normalization.")

  if len(large_batch) == 0:
    logging.info("No more ingredients to process. Exiting.")
    return False

  batches = []
  for i in range(0, len(large_batch), batch_size):
    batch = large_batch[i:i + batch_size]
    if batch:  # Only add non-empty batches
      batches.append(batch)

  logging.info(f"Split into {len(batches)} batches for parallel LLM processing")

  # Process batches in parallel
  all_results = []
  with ThreadPoolExecutor(max_workers=parallel_batches) as executor:
    # Submit all LLM tasks
    future_to_batch = {
      executor.submit(process_llm_batch, batch, llm_client): i
      for i, batch in enumerate(batches)
    }

    # Collect results as they complete
    for future in as_completed(future_to_batch):
      batch_idx = future_to_batch[future]
      try:
        batch_results = future.result()
        all_results.extend(batch_results)
        logging.info(f"Completed LLM processing for batch {batch_idx + 1}/{len(batches)}")
      except Exception as exc:
        logging.error(f"Batch {batch_idx} generated an exception: {exc}")
        # Continue processing other batches even if one fails

  # Write all results to database sequentially (safe for SQLite)
  logging.info(f"Writing {len(all_results)} normalized ingredients to database")
  for normalised in all_results:
    conn.execute("""
      update ingredient
      set density_ingredient = :density_ingredient
      where ingredient_id = :ingredient_id
    """, {
      'density_ingredient': normalised['normalised_name'],
      'ingredient_id': normalised['ingredient_id']
    })

  conn.commit()
  logging.info("Database update committed successfully")
  return True

def main():
  conn = sqlite3.connect('recipes.db', check_same_thread=False, uri=True)
  conn.row_factory = sqlite3.Row

  llm_client = LLMClient()

  while True:
    should_continue = process_multiple_batches(conn, llm_client, batch_size=100, parallel_batches=4)
    if not should_continue:
      break

if __name__ == "__main__":
  main()
