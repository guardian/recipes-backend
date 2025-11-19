from argparse import ArgumentParser

from config import Config, load_config
from csv_state import load_csv_state
from recipe_processor import ReportStatus, Report

import requests

def update_recipe(report: Report, config: Config):
  # Placeholder for the actual update logic
  print(f"Updating recipe from file: {report.filename}")

  headers = {
    "content-type": "application/json",
    "accept": "application/json",
  }
  with open(report.filename, 'r') as f:
    data = f.read()

  # TODO: only post the ingredients and instructions parts of the recipe

  requests.post(
    url=f"{config.integration_url}/{report.composer_id}",
    data=data,
    headers=headers,
  )

def main(state_folder: str):
  reports = load_csv_state(state_folder)
  config = load_config()

  for report in reports:
    print(f"Recipe ID: {report.recipe_id}, Status: {report.status}, Filename: {report.filename}")
    if report.status == ReportStatus.ERROR:
      print(f"Skipping recipe {report.recipe_id} due to error during Stage 1: {report.reason}")
      continue
    if not report.filename:
      print(f"Skipping recipe {report.recipe_id} due to missing filename in report.")
      continue

    update_recipe(report, config)



if __name__ == "__main__":
  arg_parser = ArgumentParser(description='Stage 2 of the migration to recipe v3')
  arg_parser.add_argument('-s', '--state-folder', type=str, required=True, help='Path to the state folder')

  args = arg_parser.parse_args()
  main(state_folder=args.state_folder)
