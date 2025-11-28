import json
import logging
from argparse import ArgumentParser

import requests
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn, TimeRemainingColumn, MofNCompleteColumn

from config import Config, load_config
from csv_state import load_stage1_csv_state, Stage1Report, Stage2Report, Stage2ReportStatus, Stage1ReportStatus, \
  load_stage2_csv_state, append_stage2_report
from services import fetch_flexible_article, FlexibleError
from fancy_logging import init_logger, get_console
from ssm_params import fetch_ssm_param

logger = logging.getLogger(__name__)

def update_recipe(report: Stage1Report, config: Config) -> Stage2Report:
  logger.info(f"Updating recipe from file: {report.filename}")

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

  # log the recipe as a curl command for debugging
  logger.debug(f"Curl equivalent:\n"
               f"curl {config.integration_write_url}update-recipe-element/{report.composer_id} \\\n"
               f"-H 'content-type: application/json' \\\n"
               f"-H 'accept: application/json' \\\n"
               f"-d '{json.dumps(recipe_update)}'")

  response = requests.post(
    url=f"{config.integration_write_url}update-recipe-element/{report.composer_id}",
    data=json.dumps(recipe_update),
    headers=headers,
    verify=config.ca_bundle_path,
  )
  if response.status_code == 200:
    logger.info(f"Successfully updated recipe {report.recipe_id}")
    return Stage2Report.from_stage1_report(report, Stage2ReportStatus.SUCCESS, None)
  else:
    logger.error(f"Failed to update recipe {report.recipe_id}: {response.status_code} {response.text}")
    return Stage2Report.from_stage1_report(
      report,
      Stage2ReportStatus.ERROR,
      f"Failed to update recipe: {response.status_code} {response.text}"
    )


def has_article_been_updated(report: Stage1Report, config: Config) -> bool:
  article = fetch_flexible_article(report.composer_id, config)
  if article is None:
    logger.warning(f"Article {report.capi_id} not found in CAPI")
    return False
  if isinstance(article, FlexibleError):
    logger.warning(f"Error fetching flexible article for composer ID {report.composer_id}: {article.error_message}")
    return False

  if article.revision != int(report.revision):
    logger.warning(
      f"Recipe {report.recipe_id} has been updated since Stage 1. Last updated at CAPI: {article.revision}, recorded: {report.revision}")
    return True
  return False


def handle_error_cases(report: Stage1Report) -> Stage2Report | None:
  error_report: Stage2Report | None = None
  if report.status == Stage1ReportStatus.ERROR:
    logger.warning(f"Skipping recipe {report.recipe_id} due to error during Stage 1: {report.reason}")
    error_report = Stage2Report.from_stage1_report(
      report,
      Stage2ReportStatus.ERROR,
      f"Skipped due to Stage 1 error: {report.reason}"
    )
  elif not report.filename:
    logger.warning(f"Skipping recipe {report.recipe_id} due to missing filename in report.")
    error_report = Stage2Report.from_stage1_report(
      report,
      Stage2ReportStatus.ERROR,
      "Missing filename in report"
    )
  return error_report


def main(state_folder: str, environment: str, force: bool):
  init_logger()

  if not force:
    should_publish_v2 = fetch_ssm_param(f"/{environment}/feast/recipes-responder/should-publish-v2")
    if should_publish_v2 is None or bool(should_publish_v2) is True:
      logger.error(f"Aborting Stage 2: should-publish-v2 flag is set to {should_publish_v2}. Set it to False then redeploy the backend.")
      return

  stage1_reports = load_stage1_csv_state(state_folder)
  stage2_reports = load_stage2_csv_state(state_folder)

  logger.info(f"Loading config for environment: {environment}")
  config = load_config(environment)
  processed_recipe_ids = {report.recipe_id for report in stage2_reports}

  total_recipes = len(stage1_reports)
  previously_completed = len(processed_recipe_ids)

  logger.info(f"Processing {total_recipes} recipes in Stage 2...")
  logger.info(f"Skipping {previously_completed} already processed recipes")

  # group reports per capi_id, ignore items already processed in stage 2
  grouped_reports: dict[str, list[Stage1Report]] = {}
  for report in stage1_reports:
    if report.recipe_id in processed_recipe_ids:
      logger.info(f"Skipping recipe {report.recipe_id} as it has already been processed in Stage 2.")
      continue
    if report.capi_id not in grouped_reports:
      grouped_reports[report.capi_id] = []
    grouped_reports[report.capi_id].append(report)

  session_completed = 0

  # Create progress bar with rich
  with Progress(
    SpinnerColumn(),
    TextColumn("[progress.description]{task.description}"),
    BarColumn(),
    MofNCompleteColumn(),
    TaskProgressColumn(),
    TimeRemainingColumn(),
    console=get_console(),  # Use shared console with logging
    transient=False,  # Keep progress bar visible after completion
  ) as progress:

    task = progress.add_task(
      "[cyan]Updating recipes...",
      total=total_recipes,
      completed=previously_completed,
    )

    for report_group in grouped_reports.values():
      # filter out groups where the whole group is in error
      if all(report.status == Stage1ReportStatus.ERROR for report in report_group):
        for report in report_group:
          logger.warning(f"Skipping recipe {report.recipe_id} due to error during Stage 1: {report.reason}")
          append_stage2_report(state_folder, Stage2Report.from_stage1_report(
            report,
            Stage2ReportStatus.ERROR,
            f"Skipped due to Stage 1 error: {report.reason}"
          ))
          session_completed += 1
          progress.update(task, completed=previously_completed + session_completed)
        continue

      first_report = report_group[0]
      if has_article_been_updated(first_report, config):
        logger.info(f"Skipping article {first_report.recipe_id} due to updates in CAPI article.")
        for report in report_group:
          append_stage2_report(state_folder, Stage2Report.from_stage1_report(
            report,
            Stage2ReportStatus.CAPI_UPDATED,
            "Skipped due to updates in CAPI article"
          ))
          session_completed += 1
          progress.update(task, completed=previously_completed + session_completed)
        continue

      for report in report_group:
        logger.info(f"Recipe ID: {report.recipe_id}, Status: {report.status}, Filename: {report.filename}")
        error_report = handle_error_cases(report)
        if error_report is not None:
          append_stage2_report(state_folder, error_report)
          session_completed += 1
          progress.update(task, completed=previously_completed + session_completed)
          continue

        stage2_report = update_recipe(report, config)
        append_stage2_report(state_folder, stage2_report)
        session_completed += 1
        progress.update(task, completed=previously_completed + session_completed)

  logger.info(f"All done. Processed {session_completed} recipes in this session.")
  logger.info(f"State directory: {state_folder}")


if __name__ == "__main__":
  arg_parser = ArgumentParser(description='Stage 2 of the migration to recipe v3')
  arg_parser.add_argument('-s', '--state-folder', type=str, required=True, help='Path to the state folder')
  arg_parser.add_argument('-e', '--environment', type=str, default='CODE', choices=['LOCAL', 'CODE', 'PROD'], help='The environment to use (LOCAL, CODE, PROD)')
  arg_parser.add_argument('--force', type=bool, default=False, help='Do not check the state of the v2 flag')

  args = arg_parser.parse_args()
  main(state_folder=args.state_folder, environment=args.environment, force=args.force)
