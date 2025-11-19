from csv import DictReader

from recipe_processor import Report

def stage_1_csv_filename(state_folder: str) -> str:
  return f"{state_folder}/stage-1-results.csv"

def load_csv_state(state_folder: str) -> list[Report]:
  reports = []
  with open(stage_1_csv_filename(state_folder), newline='') as csvfile:
    reader = DictReader(csvfile)
    for row in reader:
      reports.append(Report(**row))
  return reports
