import csv
import sqlite3

from llm import LLMClient
from normalise_ingredients import process_llm_batch, NormalisedIngredient

datasets = {
  'guardian': {
    'file': './datasets/guardian.csv',
    'density': 'kg/L',
    'specific_gravity': 'specific_gravity',
    'ingredient': 'ingredient'
  },
  'fao': {
    'file': './datasets/fao.csv',
    'density': 'Density in g/ml (including mass and bulk density)',
    'specific_gravity': 'Specific gravity',
    'ingredient': 'Food name and description'
  }
}

def main(dataset: str):
  conn = sqlite3.connect('recipes.db', check_same_thread=False, uri=True)
  conn.row_factory = sqlite3.Row

  llm_client = LLMClient()

  DENSITY = datasets[dataset]['density']
  SPECIFIC_GRAVITY = datasets[dataset]['specific_gravity']
  INGREDIENT = datasets[dataset]['ingredient']
  source = datasets[dataset]['file']

  # open the CSV with headers as a dict ./datasets/guardian.csv
  with open(source) as csvfile:
    reader = csv.DictReader(csvfile)
    densities = [{'id': i, 'key': item[INGREDIENT], 'density': item.get(DENSITY) or item.get(SPECIFIC_GRAVITY) } for i, item in enumerate(reader)]

  to_normalise = [{'ingredient_id': item['id'], 'name': item['key']} for item in densities]
  result: list[NormalisedIngredient] = []

  for i in range(0, len(to_normalise), 100):
      batch = to_normalise[i:i+100]
      print(f"processing batch of {len(batch)} items")
      result.extend(process_llm_batch(batch, llm_client))
      print(f"{len(batch)} processed")

  id_to_normalised = {item.ingredient_id: item for item in result}
  for item in densities:
    normalised = id_to_normalised.get(item['id'])
    if normalised:
      item['normalised_name'] = normalised.normalised_name
      item['us_customary'] = normalised.us_customary
      item['source'] = source
    else:
      raise Exception(f'Could not normalise ingredient {item["key"]}')


  # create density table if not exist
  conn.execute("""
    create table if not exists density (
      id integer primary key,
      ingredient text not null,
      normalised_name text not null,
      density real not null,
      us_customary integer not null,
      source text not null
    )
  """)

  # then insert many
  conn.executemany("""
    insert into density (ingredient, normalised_name, density, us_customary, source)
    values (:key, :normalised_name, :density, :us_customary, :source)
  """, densities)

  conn.commit()



if __name__ == "__main__":
  import argparse
  parser = argparse.ArgumentParser(description='Normalise datasets')
  parser.add_argument("--dataset", choices=datasets.keys(), required=True, help="Dataset to normalise")
  args = parser.parse_args()
  main(args.dataset)
