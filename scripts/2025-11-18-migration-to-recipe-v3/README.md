# Migration to recipes v3

The time has come to migrate our recipes to version 3.
As a reminder they differ from version 2 by having extra properties called "templates", that fully capture the semantic of ingredients and steps.

## Requirements

Two stage migrations. Stage 1 converts recipes and writes them to disc. Stage 2 writes the recipes to CAPI.
The migration will be run on my laptop.

### Stage 1
- Create a state folder if one isn’t passed as a parameter 
- Keep track of which recipe is processed with a CSV file, as well as the last modification date of the CAPI article 
- For each article in indexv2.json 
- call CAPI 
- extract recipes 
- call the templatiser 
- write an update to the state, store the recipe as a flat json file
- This process can be resumed by reading the CSV file and skipping already processed recipes
- The recipes are processed in parallel, with a parameter to control the parallelism

### Stage 2

- Check the v2 flag is correctly set. Throw an error otherwise 
- Group the recipes by their parent articles, to ensure writes are minimised as well as making the date check easier to understand 
- Check the article date matches the one in the CSV to ensure the migration was done on the latest version of the article.

# Diary

## 2025-11-18
- initialise repo
- import logic from previous spike
- have multiple threads for processing the recipes, but one to write the CSV file
- read the CSV file on startup to skip already processed recipes
- pre-process the data to re-compute the text field
  - this causes an issue where we have no amount:
    - either we ignore the unit when there's no amount and we're potentially missing data that wasn't properly structured
    - or we always add the unit, which is sometimes incorrect

# 2025-11-19
- Started working on stage 2
- Looking at the integration part of composer. TODO: will need to save the composer id during stage 1
- Local URL seems to be `https://import.flexible.local.dev-gutools.co.uk/recipes/import/set-recipe-elements/6915a1e3480e6e459ffd7924`
- where we use the composer and ID (and not the CAPI ID as I initially thought)
- Authentication is done with HMAC, need to test it. Looking at the configuration, it seems it's been removed from PROD and CODE. Will test adding it back locally.
