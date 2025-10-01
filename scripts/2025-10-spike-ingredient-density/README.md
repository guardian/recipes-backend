# Spike ingredient density

This work focuses on enabling the unit conversion of our recipes from UK (metric) to US (imperial).

Anything expressed as a volume can be converted to cups pretty easily as cups is a unit of volume. This represents about 800 ingredients.
However, any ingredient expressed as a weight can only be converted to cups if we have its density. This around 4500 distinct ingredients.

## Data

We have
- our corpus of about 7000 recipes, totalling 84000 ingredients
- a [list of ingredient density](https://docs.google.com/spreadsheets/d/1XGVOonMclR14JOS7tfwfd772tr8k9V7CYsrAay6Uz4g/edit?gid=0#gid=0) as measured by someone hired by The Guardian


## Diary
### 2025-10-01

Focus on trying to understand what's the intersection between these two datasets.

The main challenge resides in the fact that we're trying to match two free form strings, with all the variation that can exist.

For instance here's a sample of onion ingredients in our recipes:

```
baby onions
brown onion
brown onions
brown onions (about 3)
button onions or shallots
chopped onion
chopped red onion
```

And here's how it's captured in our density mapping `Onions (fresh, diced)`

My current thinking is to have a normalization  phase `1 brown onion, diced` => `diced onion` then `Onions (fresh, diced)` => `diced onion` and attempt to match on the normalised text.

This normalisation phase could be done by an LLM, that's what I'll explore today.

Steps:
- Generating the model with quicktype `npx quicktype --src-lang schema --lang python --pydantic-base-model --out models.py ../../schema/*.json`
- Downloading all the individual recipes into the data folder `aws s3 sync --profile feast --exclude '*.pdf' s3://feast-recipes-static-prod/content/ ./data/`
- Vibe coded a script to load all the recipes in a database `build-db.sh`
- Two recipes have a duplicate ID `rm data/ofBT9I5CpDmW1fFKxVDsv8yTOykqLbCcWyEWjs3-hAg` `rm data/SZ415NP_nfkkwb1-ybWY7xPRnpvaI5zDsMZgUCdrsXA`, rerun db script
- Rebased on recipe-template-2 to get the latest schema, then re-run the code generation
- Hesitating between starting from the files in the data folder or by reading ingredients to process from the db. I'm adding a primary key to the db rows and will start from the db.
- Got the prototype running by reading from the DB and processing 4 batches of 100 ingredients in parallel. First results look interesting but need to iterate on the prompt:
```
small leeks => small leek // we may not want to keep the size of the leek
small courgettes => small courgette // same here

tinned peaches in syrup => tinned peaches // we don't care about tins, so maybe tell the LLM to ignore these
sourdough bread,"cut into 2cm-thick slices, lightly toasted and cut again into 4cm chunks" => sourdough bread chunks // the fact the bread is sourdough is not relevant

yellow pepper,"(about 2), stalks, seeds and pith removed and discarded, flesh thinly sliced" => sliced yellow pepper // don't care about the colour
brown and/or puy lentils => brown lentils // but here we do care?
thinly sliced in cross-section circles (we use a mandolin) red onion => sliced red onion => don't care about the colour

```
- Result after day 1. Focusing on ingredients measured in g or kg, and ignoring any tinned ingredient, we normalise 23873 ingredients into 3136 unique ingredients.
