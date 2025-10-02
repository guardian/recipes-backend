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
- ~~Generating the model with quicktype `npx quicktype --src-lang schema --lang python --pydantic-base-model --out models.py ../../schema/*.json`~~ => never used
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

### 2025-10-02
- starting the day by reviewing what was produced yesterday, and iterating over the prompt. Re-triggering the processing (takes about 40 minutes). We're down to 2513 unique ingredients.
- it occurs to me that a lot of ingredients shouldn't be expressed in cups. Pasta, meat, fish, etc. I should adapt my code and get the LLM to flag what should be converted and what shouldn't.
- iterate more on the prompt, introduce a flag us_customary that describes whether an ingredient should be converted or not.
- once we only select the ones that (according to an llm) should be using the us customary system, we're down to 1872 unique normalised ingredients

#### How many ingredients do we need density for?
Now to the million $ question. What percentage of our recipes can we cover by only having the density of x ingredients?

The SQL request is this one (and I hope I got it right).
We're taking the most popular ingredients that should use the us customary system, and pretending we have the density for there.
Then we're looking for all the recipes where there aren't any ingredient that need us_customary that aren't part of the popular ingredients. 
It's a double negative but that's the only way I found to express this in SQL

```sql
with ingredient_with_density_known as (select ingredient.density_ingredient, count(*)
                                       from ingredient
                                       where ingredient.us_customary = 1
                                       group by ingredient.density_ingredient
                                       order by count(*) desc
                                       limit x) -- this is where the x variable is
select count(distinct r.recipe_id) / 6872.0 * 100.0 as coverage,
       count(distinct r.recipe_id)                  as absolute
from recipe r
where not exists (select 1
                  from ingredient i
                  where i.recipe_id = r.recipe_id
                    and i.us_customary = 1
                    and (
                    not exists (select 1
                                from ingredient_with_density_known p
                                where p.density_ingredient = i.density_ingredient)
                    ))
```

| x    |recipe count|      % | popularity | xth ingredient        |
|------|------------|--------|------------|-----------------------|
|    1 |       1503 | 21.8 % |       1309 | caster sugar          |
|   50 |       2584 | 37.6 % |         53 | granulated sugar      |
|  100 |       3171 | 46.1 % |         26 | salt                  | <- salt not well normalised
|  150 |       3610 | 52.5 % |         17 | grated carrot         |
|  200 |       3948 | 57.5 % |         13 | grated beetroot       |
|  300 |       4467 | 65.5 % |          8 | blackcurrant          |
|  400 |       4845 | 70.5 % |          5 | whole milk            |
|  500 |       5151 | 74.9 % |          4 | mangetout             |
|  600 |       5389 | 78.4 % |          3 | pistachio paste       |
|  700 |       5599 | 81.5 % |          3 | agave syrup           |
|  800 |       5741 | 83.5 % |          2 | moong dal             |
|  900 |       5895 | 85.8 % |          2 | crumbled goat cheese  |
| 1000 |       6032 | 87.7 % |          1 | wasabi                |
| 1872 |       6812 | 99.1 % |          1 | not sure why not 100% |

300 seems to be where there's the most value per ingredient

#### How many of these ingredient's density do we already have?

- [This doc](https://docs.google.com/spreadsheets/d/1XGVOonMclR14JOS7tfwfd772tr8k9V7CYsrAay6Uz4g/edit?gid=0#gid=0), measured by the Guardian contains about 150 to 200. 
- [This other doc](https://www.fao.org/4/ap815e/ap815e.pdf) published by the USDA contains a whole bunch of ingredient density.

How many can we match if we make it go through the same normalisation process?

- Exported the guardian measures to CSV
- Wrote some code to normalise the ingredients and insert it into a new table
  - Out of the 199 ingredients in the dataset, 144 are in the recipes.
  - Coverage is underwhelming at 25.3% and 1743 recipes.

### 2025-10-03
  // TODO investigate:
    - why is our coverage so low
    - what ingredients are in the guardian density dataset but not in our recipes
    - export and normalise the data from the USDA dataset
