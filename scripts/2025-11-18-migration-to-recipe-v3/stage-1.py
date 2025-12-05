import dataclasses
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from csv import DictWriter
from queue import Queue
from datetime import datetime
from argparse import ArgumentParser
import os
from threading import Thread
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn, TimeRemainingColumn, MofNCompleteColumn
from fancy_logging import init_logger, get_console

from config import load_config
from csv_state import load_stage1_csv_state, stage_1_csv_filename, Stage1Report
from recipe_processor import process_recipe_with_error_handling
from services import fetch_index, ArticleRecipeReferences, RecipeReference

logger = logging.getLogger(__name__)

def writer_thread(result_queue: Queue[Stage1Report | None], filename):
  """Dedicated thread for writing to CSV"""
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
      logger.info(f"Writing report for recipe_id={row.recipe_id}")
      writer.writerow(dataclasses.asdict(row))
      f.flush()  # Ensure immediate write
      result_queue.task_done()


def main(parallelism: int, environment: str, state_folder: str = None):
  init_logger()
  processed_recipe_ids: set[str] = set()

  if state_folder is None:
    timestamp = datetime.now().strftime('%Y%m%dT%H%M%S')
    state_folder = f"./data/migration-{timestamp}"
  else:
    reports = load_stage1_csv_state(state_folder)
    processed_recipe_ids = {report.recipe_id for report in reports}


  recipes_folder = os.path.join(state_folder, "recipes")
  os.makedirs(recipes_folder, exist_ok=True)

  logger.info(f"Loading config for environment: {environment}")
  config = load_config(environment)

  result_queue: Queue[Stage1Report | None] = Queue()

  writer = Thread(target=writer_thread, args=(result_queue, stage_1_csv_filename(state_folder)))
  writer.start()

  recipes = fetch_index(config)
  # recipes = [RecipeReference("ef09faeb822843aa8699deb617e96f50", "lifeandstyle/2025/oct/13/lime-dal-with-roast-squash-and-chilli-cashews")]
  # recipes = [RecipeReference("3083b1a8a9554446ae59b2bf11588459", "test/2025/nov/24/brothy-vinegar-noodles-with-mushrooms-and-sesame")]
  total_recipes = len(recipes)
  logger.info(f"Starting processing in {state_folder}")
  logger.info(f"Found {len(recipes)} recipes to process")

  previously_completed = 0

  # group the recipes per capi_id, filter out already processed ones
  recipes_by_capi_id: dict[str, list[str]] = {}
  for recipe in recipes:
    if recipe.recipe_id not in processed_recipe_ids:
      if recipe.capi_id not in recipes_by_capi_id:
        recipes_by_capi_id[recipe.capi_id] = []
      recipes_by_capi_id[recipe.capi_id].append(recipe.recipe_id)
    else:
      previously_completed += 1

  logger.info(f"Skipping {previously_completed} already processed recipes")

  session_cost = 0.0
  session_completed = 0


  # Create progress bar with rich
  with Progress(
    SpinnerColumn(),
    TextColumn("[progress.description]{task.description}"),
    BarColumn(),
    MofNCompleteColumn(),
    TaskProgressColumn(),
    TimeRemainingColumn(),
    TextColumn("💰 ${task.fields[cost]:.4f} (avg ${task.fields[avg_cost]:.4f}/recipe)"),
    console=get_console(),  # Use shared console with logging
    transient=False,  # Keep progress bar visible after completion
  ) as progress:

    task = progress.add_task(
      "[cyan]Processing recipes...",
      total=total_recipes,
      completed=previously_completed,
      cost=session_cost,
      avg_cost=0.0,
    )

    with ThreadPoolExecutor(max_workers=parallelism) as executor:
      article_recipe_references_list = [ArticleRecipeReferences(capi_id, recipes) for capi_id, recipes in list(recipes_by_capi_id.items())]
      futures = [executor.submit(process_recipe_with_error_handling, result_queue, config, article_recipes, recipes_folder) for article_recipes in article_recipe_references_list]
      for future in as_completed(futures):
        try:
          results = future.result()
          # Add cost if it's a valid number
          try:
            for result in results:
              session_cost += float(result.cost)
              session_completed += 1
              progress.update(task, completed=previously_completed + session_completed, cost=session_cost, avg_cost=(session_cost/session_completed))
          except (ValueError, TypeError):
            logger.warning(f"Invalid cost value: {result.cost}")
        except Exception as e:
          logger.error(f"Error processing recipe: {e}")
          import traceback
          logger.error(traceback.format_exc())

  result_queue.put(None)
  writer.join()
  logger.info(f"All done. State directory was {state_folder}")
  logger.info(f"Next step is uv run stage-2.py -s {state_folder} -e {environment}")



if __name__ == "__main__":
  arg_parser = ArgumentParser(description='Stage 1 of the migration to recipe v3')
  arg_parser.add_argument('-p', '--parallelism', type=int, default=1, help='Number of parallel tasks to use')
  arg_parser.add_argument('-s', '--state-folder', type=str, default=None, help='Path to the state folder')
  arg_parser.add_argument('-e', '--environment', type=str, default="CODE", choices= ["LOCAL", "CODE", "PROD"] ,help='The environment to use (LOCAL, CODE, PROD)')

  args = arg_parser.parse_args()
  main(parallelism=args.parallelism, state_folder=args.state_folder, environment=args.environment)
