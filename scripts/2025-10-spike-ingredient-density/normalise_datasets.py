import csv
import sqlite3

from llm import LLMClient
from normalise_imgredients import process_llm_batch

DENSITY='kg/L'
INGREDIENT='ingredient'

def main():
  conn = sqlite3.connect('recipes.db', check_same_thread=False, uri=True)
  conn.row_factory = sqlite3.Row

  llm_client = LLMClient()

  source = './datasets/guardian.csv'

  # open the CSV with headers as a dict ./datasets/guardian.csv
  with open(source) as csvfile:
    reader = csv.DictReader(csvfile)
    densities = [{'id': i, 'key': item[INGREDIENT], 'density': item[DENSITY]} for i, item in enumerate(reader)]

  to_normalise = [{'ingredient_id': item['id'], 'name': item['key']} for item in densities]
  result = process_llm_batch(to_normalise, llm_client)

  id_to_normalised = {item['ingredient_id']: item for item in result}
  for item in densities:
    normalised = id_to_normalised.get(item['id'])
    if normalised:
      item['normalised_name'] = normalised['normalised_name']
      item['us_customary'] = normalised['us_customary']
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
  main()
