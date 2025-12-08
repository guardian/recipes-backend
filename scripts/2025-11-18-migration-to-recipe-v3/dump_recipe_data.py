import json
import logging
import os
from argparse import ArgumentParser

from config import load_config
from fancy_logging import init_logger
from services import fetch_index, fetch_flexible_article, fetch_CAPI_article

logger = logging.getLogger(__name__)

def main(state_folder: str, environment: str):
  init_logger()
  config = load_config(environment=environment)

  os.makedirs(state_folder, exist_ok=True)

  recipes = fetch_index(config)

  capi_ids = set()
  for recipe in recipes:
    capi_ids.add(recipe.capi_id)

  for capi_id in capi_ids:
    try:
      capi_fetch_response = fetch_CAPI_article(capi_id, config)
      if capi_fetch_response is None:
        logger.warning(f"Article {capi_id} not found in CAPI")
        continue

      # fetch the recipes from composer (flexible)
      composer_id = capi_fetch_response["response"]["content"]["fields"].get("internalComposerCode") if capi_fetch_response is not None else None
      flexible_article = fetch_flexible_article(composer_id, config)

      for recipe in flexible_article.recipes:
        with open(os.path.join(state_folder, f"{recipe["id"]}.json"), "w") as f:
          f.write(json.dumps(recipe, indent=2))
    except Exception as e:
      logger.error(f"Error processing CAPI article {capi_id}: {e}")
  logger.info("ALl done!")

if __name__ == "__main__":
  arg_parser = ArgumentParser(description='Stage 2 of the migration to recipe v3')
  arg_parser.add_argument('-s', '--state-folder', type=str, required=True, help='Path to the state folder')
  arg_parser.add_argument('-e', '--environment', type=str, default='CODE', choices=['LOCAL', 'CODE', 'PROD'], help='The environment to use (LOCAL, CODE, PROD)')

  args = arg_parser.parse_args()
  main(state_folder=args.state_folder, environment=args.environment)
