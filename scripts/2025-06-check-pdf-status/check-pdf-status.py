#!/usr/bin/env python3

from recipe_api import load_index
from pprint import pprint
import argparse
import requests


def test_url(url: str, session:requests.Session) -> bool:
  response = session.head(url)
  if response.status_code == 200:
    return True
  elif response.status_code == 404:
    return False
  else:
    raise Exception(f"Unexpected status code {response.status_code} from api")


### START MAIN
parser = argparse.ArgumentParser()
parser.add_argument('--base', '-b', type=str, default='https://recipes.code.dev-guardianapis.com',
                    help='Recipes API base URL')
args = parser.parse_args()

total = 0
recipe_count = 0
pdf_count = 0

session = requests.Session()

for entry in load_index(args.base):
  #pprint(entry)
  recipe_url = f'{args.base}/content/{entry["checksum"]}'
  pdf_url = f'{recipe_url}.pdf'

  have_recipe = test_url(recipe_url, session)
  have_pdf = test_url(pdf_url, session)

  total+=1
  if have_pdf:
    pdf_count+=1
  if have_recipe:
    recipe_count+=1
  print(f"{have_recipe} {have_pdf} {entry['checksum']} {entry['recipeUID']}")

print(f"End of run. Out of {total} indexed, {recipe_count} have recipes and {pdf_count} have pdfs")
