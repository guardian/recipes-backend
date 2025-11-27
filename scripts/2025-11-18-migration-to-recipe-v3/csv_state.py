import dataclasses
import os
from csv import DictReader, DictWriter
from dataclasses import dataclass
from enum import Enum

class Stage1ReportStatus(Enum):
  SUCCESS = "SUCCESS"
  ACCEPTED_BY_LLM = "ACCEPTED_BY_LLM"
  REVIEW_NEEDED = "REVIEW_NEEDED"
  ERROR = "ERROR"
  INCOMPLETE = "INCOMPLETE" # the LLM could not get it to match after 5 attempts

@dataclass(frozen=True)
class Stage1Report:
  recipe_id: str
  capi_id: str
  composer_id: str | None
  filename: str
  status: Stage1ReportStatus
  reason: str | None
  diff: str | None
  expected: str | None
  received: str | None
  cost: str
  revision: int

  @staticmethod
  def error(recipe_id: str, capi_id: str, reason: str) -> 'Stage1Report':
    return Stage1Report(
      recipe_id=recipe_id,
      capi_id=capi_id,
      composer_id=None,
      filename="",
      status=Stage1ReportStatus.ERROR,
      reason=reason,
      diff=None,
      expected=None,
      received=None,
      cost="0",
      revision=0,
    )


def stage_1_csv_filename(state_folder: str) -> str:
  return f"{state_folder}/stage-1-results.csv"

def load_stage1_csv_state(state_folder: str) -> list[Stage1Report]:
  reports = []
  with open(stage_1_csv_filename(state_folder), newline='') as csvfile:
    reader = DictReader(csvfile)
    for row in reader:
      stage1_report = Stage1Report(
        recipe_id=row['recipe_id'],
        capi_id=row['capi_id'],
        composer_id=row['composer_id'] if row['composer_id'] else None,
        filename=row['filename'],
        status=Stage1ReportStatus(row['status'].removeprefix("Stage1ReportStatus.")),
        reason=row['reason'] if row['reason'] else None,
        diff=row['diff'] if row['diff'] else None,
        expected=row['expected'] if row['expected'] else None,
        received=row['received'] if row['received'] else None,
        cost=row['cost'],
        revision=int(row['revision']),
      )
      reports.append(stage1_report)
  return reports

class Stage2ReportStatus(Enum):
  SUCCESS = "success"
  ERROR = "error"
  CAPI_UPDATED = "capi_updated"

@dataclass(frozen=True)
class Stage2Report(Stage1Report):
  stage2_status: Stage2ReportStatus
  failure_reason: str | None

  @staticmethod
  def from_stage1_report(report: Stage1Report, status: Stage2ReportStatus,
                         failure_reason: str | None) -> 'Stage2Report':
    return Stage2Report(
      **dataclasses.asdict(report),
      stage2_status=status,
      failure_reason=failure_reason,
  )

def stage_2_csv_filename(state_folder: str) -> str:
  return f"{state_folder}/stage-2-results.csv"

def append_stage2_report(state_folder: str, report: Stage2Report):
  filename = stage_2_csv_filename(state_folder)
  file_exists = os.path.exists(filename) and os.path.getsize(filename) > 0
  with open(filename, 'a', newline='') as f:
    fieldnames = [field.name for field in dataclasses.fields(Stage2Report)]
    writer = DictWriter(f, fieldnames=fieldnames)
    if not file_exists:
      writer.writeheader()
      f.flush()

    writer.writerow(dataclasses.asdict(report))
    f.flush()

def load_stage2_csv_state(state_folder: str) -> list[Stage2Report]:
  reports = []
  filename = stage_2_csv_filename(state_folder)
  if not os.path.exists(filename):
    return reports
  with open(filename, newline='') as csvfile:
    reader = DictReader(csvfile)
    for row in reader:
      reports.append(Stage2Report(**row))
  return reports
