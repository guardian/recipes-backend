from dataclasses import dataclass
from datetime import datetime
from queue import Queue

from services import RecipeReference


@dataclass(frozen=True)
class Report:
  recipe_id: str
  filename: str
  diff: str
  last_updated_at: str

def process_recipe(result_queue: Queue[Report | None], recipe_input: RecipeReference) -> Report:
  print(f"Processing recipe_id={recipe_input.recipe_id}...")
  report = Report(
    recipe_id=recipe_input.recipe_id,
    filename=f"{recipe_input.recipe_id}.json",
    diff="N/A",
    last_updated_at=datetime.now().isoformat()
  )
  result_queue.put(report)
  return report
