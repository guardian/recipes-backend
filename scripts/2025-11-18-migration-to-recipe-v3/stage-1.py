import dataclasses
from concurrent.futures import ThreadPoolExecutor, as_completed
from csv import DictWriter
from queue import Queue
from datetime import datetime
from argparse import ArgumentParser
import os
from threading import Thread

from config import load_config
from csv_state import load_stage1_csv_state, stage_1_csv_filename, Stage1Report
from recipe_processor import process_recipe_with_error_handling
from services import fetch_index, ArticleRecipeReferences, RecipeReference
from tui_logger import get_tui


def writer_thread(result_queue: Queue[Stage1Report | None], filename):
  """Dedicated thread for writing to CSV"""
  tui = get_tui()
  file_exists = os.path.exists(filename) and os.path.getsize(filename) > 0
  with open(filename, 'a', newline='') as f:
    fieldnames = [field.name for field in dataclasses.fields(Stage1Report)]
    writer = DictWriter(f, fieldnames=fieldnames)
    if not file_exists:
      writer.writeheader()
      f.flush()  # Ensure header is written immediately

    while True:
      row = result_queue.get()
      if row is None:  # Sentinel to stop
        result_queue.task_done()
        break
      tui.info(f"Writing report for recipe_id={row.recipe_id}")
      writer.writerow(dataclasses.asdict(row))
      f.flush()  # Ensure immediate write
      result_queue.task_done()


def main(parallelism: int, state_folder: str = None):
  tui = get_tui()
  processed_recipe_ids: set[str] = set()

  if state_folder is None:
    timestamp = datetime.now().strftime('%Y%m%dT%H%M%S')
    state_folder = f"./data/migration-{timestamp}"
  else:
    reports = load_stage1_csv_state(state_folder)
    processed_recipe_ids = {report.recipe_id for report in reports}


  recipes_folder = os.path.join(state_folder, "recipes")
  os.makedirs(recipes_folder, exist_ok=True)

  config = load_config()

  result_queue: Queue[Stage1Report | None] = Queue()

  writer = Thread(target=writer_thread, args=(result_queue, stage_1_csv_filename(state_folder)))
  writer.start()

  # recipes = fetch_index()
  recipes = [RecipeReference("00773de16f95487db266a7a9698f8959", "lifeandstyle/2025/oct/13/lime-dal-with-roast-squash-and-chilli-cashews")]
  total_recipes = len(recipes)
  tui.info(f"Found {len(recipes)} recipes to process")

  completed = 0

  # group the recipes per capi_id, filter out already processed ones
  recipes_by_capi_id: dict[str, list[str]] = {}
  for recipe in recipes:
    if recipe.capi_id not in recipes_by_capi_id:
      recipes_by_capi_id[recipe.capi_id] = []
    if recipe.recipe_id not in processed_recipe_ids:
      recipes_by_capi_id[recipe.capi_id].append(recipe.recipe_id)
    else:
      completed += 1

  tui.info(f"Skipping {completed} already processed recipes")

  # Start the TUI
  tui.start(total=total_recipes)
  tui.update_progress(completed)

  with ThreadPoolExecutor(max_workers=parallelism) as executor:
    article_recipe_references_list = [ArticleRecipeReferences(capi_id, recipes) for capi_id, recipes in recipes_by_capi_id.items()]
    futures = [executor.submit(process_recipe_with_error_handling, result_queue, config, article_recipes, recipes_folder) for article_recipes in article_recipe_references_list]
    for future in as_completed(futures):
      try:
        results = future.result()
        completed += 1
        tui.update_progress(completed)
        # Add cost if it's a valid number
        try:
          for result in results:
            cost_value = float(result.cost)
            tui.add_cost(cost_value)
        except (ValueError, TypeError):
          tui.warning(f"Invalid cost value: {result.cost}")
      except Exception as e:
        tui.error(f"Error processing recipe: {e}")
        import traceback
        tui.error(traceback.format_exc())

  # Stop TUI and writer thread
  tui.stop()
  result_queue.put(None)
  writer.join()
  tui.info("All done.")


if __name__ == "__main__":
  arg_parser = ArgumentParser(description='Stage 1 of the migration to recipe v3')
  arg_parser.add_argument('-p', '--parallelism', type=int, default=1, help='Number of parallel tasks to use')
  arg_parser.add_argument('-s', '--state-folder', type=str, default=None, help='Path to the state folder')

  args = arg_parser.parse_args()
  main(parallelism=args.parallelism, state_folder=args.state_folder)
