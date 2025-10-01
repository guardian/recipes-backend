import os
import json
import logging
from models import RecipeV2

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def main():
  data_folder = "./data"

  # Loop through the first 10 files in the data folder
  for filename in os.listdir(data_folder)[:10]:
    file_path = os.path.join(data_folder, filename)
    try:
      # Read and parse the JSON file
      with open(file_path, 'r', encoding='utf-8') as file:
        recipe_data = json.load(file)

      # Parse as Recipe object using the model
      recipe = RecipeV2.model_validate(recipe_data)

      logging.info(f"Successfully parsed recipe: {recipe.title or 'Untitled'} (ID: {recipe.id})")

      # Here you can add your ingredient normalization logic
      # For now, just confirming the parsing works

    except json.JSONDecodeError:
      logging.exception(f"Error parsing JSON in file {filename}")
    except Exception:
      logging.exception(f"Error processing file {filename}")


if __name__ == "__main__":
  main()
