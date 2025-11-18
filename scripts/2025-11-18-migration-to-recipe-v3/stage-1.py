import dataclasses
from concurrent.futures import ThreadPoolExecutor, as_completed
from csv import DictWriter
from queue import Queue
from datetime import datetime
from argparse import ArgumentParser
import os
from threading import Thread

from recipe_processor import Report, process_recipe
from services import fetch_index


def writer_thread(result_queue: Queue[Report | None], filename):
  """Dedicated thread for writing to CSV"""
  with open(filename, 'a') as f:
    fieldnames = [field.name for field in dataclasses.fields(Report)]
    writer = DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()

    while True:
      row = result_queue.get()
      if row is None:  # Sentinel to stop
        break
      print(f"Writing report for recipe_id={row.recipe_id}")
      writer.writerow(dataclasses.asdict(row))
      f.flush()  # Ensure immediate write
      result_queue.task_done()


def main(parallelism: int, state_folder: str = None):
  if state_folder is None:
    timestamp = datetime.now().strftime('%Y%m%dT%H%M%S')
    state_folder = f"./data/migration-{timestamp}"
    recipes_folder = os.path.join(state_folder, "recipes")
    os.makedirs(recipes_folder, exist_ok=True)

  print("This is stage 1 of the migration to recipe v3.")
  result_queue: Queue[Report | None] = Queue()

  writer = Thread(target=writer_thread, args=(result_queue, f"{state_folder}/results.csv"))
  writer.start()

  recipes = fetch_index()

  with ThreadPoolExecutor(max_workers=parallelism) as executor:
    futures = [executor.submit(process_recipe, result_queue, recipe_input) for recipe_input in recipes]
    for future in as_completed(futures):
      future.result()

  # Stop writer thread
  result_queue.put(None)
  writer.join()
  print("All done.")


if __name__ == "__main__":
  arg_parser = ArgumentParser(description='Stage 1 of the migration to recipe v3')
  arg_parser.add_argument('-p', '--parallelism', type=int, default=1, help='Number of parallel tasks to use')
  arg_parser.add_argument('-s', '--state-folder', type=str, default=None, help='Path to the state folder')

  args = arg_parser.parse_args()
  main(parallelism=args.parallelism, state_folder=args.state_folder)
