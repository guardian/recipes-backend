import json
from argparse import ArgumentParser

import requests

from config import Config, load_config
from csv_state import load_stage1_csv_state, Stage1Report, Stage2Report, Stage2ReportStatus, Stage1ReportStatus, \
  load_stage2_csv_state, append_stage2_report
from services import fetch_CAPI_article, find_recipe_last_updated_at


def update_recipe(report: Stage1Report, config: Config) -> Stage2Report:
  print(f"Updating recipe from file: {report.filename}")

  headers = {
    "content-type": "application/json",
    "accept": "application/json",
  }
  with open(report.filename, 'r') as f:
    data = f.read()

  raw_data = json.loads(data)
  recipe_update = {
    'id': report.recipe_id,
    'ingredients': raw_data.get("ingredients", []),
    'instructions': raw_data.get("instructions", []),
  }

  response = requests.post(
    url=f"{config.integration_url}/update-recipe-element/{report.composer_id}",
    data=json.dumps(recipe_update),
    headers=headers,
    verify=config.ca_bundle_path,
  )
  if response.status_code == 200:
    print(f"Successfully updated recipe {report.recipe_id}")
    return Stage2Report.from_stage1_report(report, Stage2ReportStatus.SUCCESS, None)
  else:
    print(f"Failed to update recipe {report.recipe_id}: {response.status_code} {response.text}")
    return Stage2Report.from_stage1_report(
      report,
      Stage2ReportStatus.ERROR,
      f"Failed to update recipe: {response.status_code} {response.text}"
    )


def has_article_been_updated(report: Stage1Report, config: Config) -> bool:
  article = fetch_CAPI_article(report.capi_id, config)
  if article is None:
    print(f"Article {report.capi_id} not found in CAPI")
    return False
  last_updated_date = find_recipe_last_updated_at(article["response"], report.capi_id)
  if last_updated_date != report.revision:
    print(
      f"Recipe {report.recipe_id} has been updated since Stage 1. Last updated at CAPI: {last_updated_date}, recorded: {report.revision}")
    return True
  return False


def handle_error_cases(report: Stage1Report) -> Stage2Report | None:
  error_report: Stage2Report | None = None
  if report.status == Stage1ReportStatus.ERROR:
    print(f"Skipping recipe {report.recipe_id} due to error during Stage 1: {report.reason}")
    error_report = Stage2Report.from_stage1_report(
      report,
      Stage2ReportStatus.ERROR,
      f"Skipped due to Stage 1 error: {report.reason}"
    )
  elif not report.filename:
    print(f"Skipping recipe {report.recipe_id} due to missing filename in report.")
    error_report = Stage2Report.from_stage1_report(
      report,
      Stage2ReportStatus.ERROR,
      "Missing filename in report"
    )
  return error_report


def main(state_folder: str):
  stage1_reports = load_stage1_csv_state(state_folder)
  stage2_reports = load_stage2_csv_state(state_folder)

  config = load_config()
  processed_recipe_ids = {report.recipe_id for report in stage2_reports}

  print(f"Processing {len(stage1_reports)} recipes in Stage 2...")

  # group reports per capi_id, ignore items already processed in stage 2
  grouped_reports: dict[str, list[Stage1Report]] = {}
  for report in stage1_reports:
    if report.recipe_id in processed_recipe_ids:
      print(f"Skipping recipe {report.recipe_id} as it has already been processed in Stage 2.")
      continue
    if report.capi_id not in grouped_reports:
      grouped_reports[report.capi_id] = []
    grouped_reports[report.capi_id].append(report)


  for report_group in grouped_reports.values():
    first_report = report_group[0]
    if has_article_been_updated(first_report, config):
      print(f"Skipping article {first_report.recipe_id} due to updates in CAPI article.")
      for report in report_group:
        append_stage2_report(state_folder, Stage2Report.from_stage1_report(
          report,
          Stage2ReportStatus.CAPI_UPDATED,
          "Skipped due to updates in CAPI article"
        ))
      continue

    for report in report_group:
      print(f"Recipe ID: {report.recipe_id}, Status: {report.status}, Filename: {report.filename}")
      error_report = handle_error_cases(report)
      if error_report is not None:
        append_stage2_report(state_folder, error_report)
        continue

      stage2_report = update_recipe(report, config)
      append_stage2_report(state_folder, stage2_report)


if __name__ == "__main__":
  arg_parser = ArgumentParser(description='Stage 2 of the migration to recipe v3')
  arg_parser.add_argument('-s', '--state-folder', type=str, required=True, help='Path to the state folder')

  args = arg_parser.parse_args()
  main(state_folder=args.state_folder)
