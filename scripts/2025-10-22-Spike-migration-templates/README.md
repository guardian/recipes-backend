# Spike migration to using templates

At this stage of development we have multiple bricks ready to be used:
- An endpoint that takes a recipe and transform it into a recipe template
- An endpoint that takes a recipe template and verifies whether it is valid or not
- A multiplatform library (node, ios, android) that can take a recipe template and render it into a recipe

The goal of this spike is to evaluate how close we are to triggereing the migration.

We'll read recipes from CAPI and transform them into recipe templates.

This will inevitably raise all the recipe templates that aren't considered to be valid by the validation endpoint.

We'll then review invalid recipe templates and decide whether we fix the checking logic, the template generation logic, or accept the differences.

## Diary

### 2025-10-22
- initialise repo and readme
- write code that load the index json, load the recipe from CAPI, then find the recipe data within the article
- improve the comparison logic to handle small and fixable differences, such quotes, whitespace etc

### 2025-10-23
- continue to iterate on the script
- have experienced prompt instability, meaning the slightest change in my prompt leads to wildly different results
  - have linked some of the instability and inconsistencies to the fact sonnet seems to not have apostrophe `’` and double quotes `“”` token output
  - this means when it try to output these because they are in the original text, it instead outputs `'` and `""` which then leads to invalid json syntax
  - I've worked around this by cleaning up the input to the model, replacing all instances of `’` with `'` and `“”` with `""`.
  - I must admit I'm pretty chuffed I found that because I was starting to get worried.
  => there's a general problem though, which is that single prompt is asking a lot for a model the size of sonnet 4.5, and long term we probably want to chunk that processing in multiple prompts.
- sonnet 4.5 is having availability issues (3pm, which is start of the day for the east coast), so I've added a 503 return code handler with a 10s sleep. That's not enough, and this is seriously slowing me down.
- I've normalised fractions in my comparison, ensuring all numbers are compared regardless of how they're expressed
- So far out of 20 recipes, 17 have an exact match between original recipe and rendered template. The three remaining diffs are:

```diff
     "300 ml evaporated milk",
-    "100 ml whole milk 2 tsp ground cinnamon",
+    "100 ml whole milk",
     "2 tsp ground cinnamon",
```
Interestingly, the LLM actually fixed the recipe here


```diff
--- expected
+++ received
@@ -14,8 +14,8 @@
   ],
   "instructions": [
     "Rub the chicken thighs with olive oil and salt, then arrange them skin side up in a single layer in a large baking dish.",
-    "Toss the halved cherry tomatoes and garlic with two tablespoons of olive oil and some salt, then tip them on top of the chicken and push the mix into the gaps between the thighs.",
+    "Toss the halved cherry tomatoes and garlic with 2 tbsp of olive oil and some salt, then tip them on top of the chicken and push the mix into the gaps between the thighs.",
     "Lay a couple of sprigs of rosemary over the top, then bake, uncovered, at 180C (160C fan)/350F/gas 4 for 45-50 minutes, until the chicken is well browned on top and cooked through.",
-    "Meanwhile, make the salad by tossing the lettuce with the cooked beans, parmesan and a dressing made from four tablespoons of olive oil, the red-wine vinegar and mustard."
+    "Meanwhile, make the salad by tossing the lettuce with the cooked beans, parmesan and a dressing made from 4 tbsp of olive oil, the red-wine vinegar and mustard."
   ]
 }
```
Here the difference comes from the fact the LLM correctly capture scalable values (4 tbsp etc), when they were written as words in the origin text. I'm on the fence about trying to fix this the comparison for this or not. If it's only numbers from 1 to 10, and a couple units that should be fine. If it's more complex we'll never get the comparison loguc to give a simple boolean as the answer, and we may have to (unfortunately) call the LLM once more to ask "are these two things the same thing?" 

```diff
--- expected
+++ received
@@ -20,10 +20,10 @@
     "4 limes, halved"
   ],
   "instructions": [
-    "Drain and rinse the soaked chickpeas and butter beans, then put them in two separate pots, cover in plenty of fresh water and boil until they\u2019re almost cooked \u2013 depending on the age of the pulses, this may take anywhere \u00adbetween 25 and 55 minutes. Once both the chickpeas and butter beans are ready, drain them into the same colander.",
-    "In a large, heavy-based pot on a medium heat, melt the butter, then saute the onion and garlicfor 20 minutes, stirring often, \u00aduntil soft and golden brown. Stir in the turmeric, add salt and \u00adpepper to taste, then transfer a third of the mix to a dish.",
+    "Drain and rinse the soaked chickpeas and butter beans, then put them in two separate pots, cover in plenty of fresh water and boil until they\u2019re almost cooked \u2013 depending on the age of the pulses, this may take anywhere between 25 and 55 minutes. Once both the chickpeas and butter beans are ready, drain them into the same colander.",
+    "In a large, heavy-based pot on a medium heat, melt the butter, then saute the onion and garlicfor 20 minutes, stirring often, until soft and golden brown. Stir in the turmeric, add salt and pepper to taste, then transfer a third of the mix to a dish.",
     "Add the chickpeas and butter beans to the onion mix still in the pot, then stir in the split peas and stock and simmer for 30 minutes, occasionally skimming off the froth, until the peas are tender.",
-    "Add the herbs, spring onions and \u00adspinach, stir and cook for 15 minutes longer; if the soup seems very thick, add a little extra stock (or water), to loosen. Taste and season generously.",
+    "Add the herbs, spring onions and spinach, stir and cook for 15 minutes longer; if the soup seems very thick, add a little extra stock (or water), to loosen. Taste and season generously.",
     "Add the noodles to the pot and cook for about 10 minutes, until they are just done.",
     "Stir in the soured cream and vinegar, and adjust the seasoning to taste. Serve in bowls garnished with the extra soured cream and the reserved cooked onion mix, and with the lime halves on the side for squeezing over."
   ]
```
Here there's a dash `\u00ad` `–` that the LLM seems incapable of outputing (possibly ignored entirely in the input token). They're here by editorial choice, so I'm not sure yet what to do about them.
I sure could remove them during the comparison, but that would mean they would also disappear completely from the recipe. Maybe the migration should have a pile of recipe to manually review?

- Let's try 40 recipes. More unexpected diffs.
```diff
--- expected
+++ received
@@ -1,14 +1,14 @@
 {
   "ingredients": [
-    "heritage tomatoes 400 g, ideally a mix of shapes, sizes and colours",
-    "red onions 100 g",
-    "cucumber 100 g",
-    "carob rusks 50 g (find at speciality delis and online",
+    "400 g heritage tomatoes, ideally a mix of shapes, sizes and colours",
+    "100 g red onions",
+    "100 g cucumber",
+    "50 g carob rusks (find at speciality delis and online",
     "dried oregano",
     "salt and pepper",
-    "good quality extra virgin olive oil 100 ml",
-    "red wine vinegar 30 ml",
-    "dijon mustard 10 g"
+    "good quality 100 ml extra virgin olive oil",
+    "30 ml red wine vinegar",
+    "10 g dijon mustard"
   ],
   "instructions": [
     "Wash the tomatoes, dry and cut into big chunks",
```
Here the LLM took some editorial freedom and decided to move the quantity to the front of the ingredient. That's a no-go.

```diff
-    "Roll out the pastry to about 2-3 mm thick. Using six 10 cm individual tart tins as a guide, cut out six circles an inch wider than the tins; reroll the pastry offcuts when you need to. Press each round of pastry firmly into a tart tin, trim off any excess, and chill in the fridge for 20 minutes.",
+    "Roll out the pastry to about 2-3 mm-thick. Using six 10 cm individual tart tins as a guide, cut out six circles an inch wider than the tins; reroll the pastry offcuts when you need to. Press each round of pastry firmly into a tart tin, trim off any excess, and chill in the fridge for 20 minutes."
```
Another punctuation issue, weirdly enough, this time it's the LLM that adds the hyphen.
```diff
-    "free-range chicken breasts 4 small, cut into large chunks",
+    "free-range chicken breasts 4, small, cut into large chunks",
```
Another case of the LLM adding punctuation that wasn't there before, but this time maybe justified?

```diff
-    "Preheat the oven to 180C fan/gas 6.",
+    "Preheat the oven to 180C/gas 6.",
```
Some oven temperature difference. The templating format I created assumed we always have at least a non fan temperature. Here the LLM made the decision of setting that temperature to 180, so the fan temperature disappears.


- I'm starting to wonder if the conversion to recipe template should be an iterative process / agentic flow, where I give tools to the LLM. I have a hunch that although there are recipe where it can't one-shot it, a couple iterations would solve the issue.
  - We could have a tool to diff, a tool to update a template, and a tool to accept a small difference (like the oven temperature not being formatted, or a value bing expressed in words instead of digits...)
- I've found a case of a recipe that wasn't structured at all, just a bunch of ingredients that actually are instructions. The LLM did a pretty good job at structuring it, but of course the diff flags everything as an error. I wonder how many cases we have like this... https://www.theguardian.com/food/2023/apr/04/nigel-slater-midweek-dinner-gnocchi-with-leeks-cream-and-custard
- Lots of diff are due to the oven. My initial assumption that we'll always have at least a non-fan temperature is wrong. This need fixing.
- Fixed the oven temperature issue.
- out of 40 recipes 27 are extact matches. 13 diffs:
  - Some of which require fixing the recipe
    - 1 error in the original recipe that the LLM fixed
    - 1 recipe isn't properly structured
  - Some of which require improving the templating logic
    - 1 difference because it templatised the wrong thing
    - 1 difference because it used words that aren't units as units.
  - Some of which require adapting the comparison logic
    - 3 diff due to a quantity expressed as digits vs words in the original
    - 3 difference of punctation
    - 3 difference because the LLM moved the quantity to the front of the ingredient

# 2025-10-24
- asking what do we want with regards to the order of quantity vs ingredient name. We might want to enforce quantity / unit / ingredient, which means the final approval of the template will have to be done by an LLM
- this also plays into the idea of having an agentic loop rather than a one shot prompt
- I'll try to explore having the same prompt, and if the diff comes back with differences, add it to the context of the conversation, this time with rules:
  - It's okay to have "2 tbsp" instead of "two tablespoons"
  - It's okay to move the ingredient quantity to the front of the ingredient
  - It's okay to have a minor punctuation difference such as hyphens or dashes
- TODO:
  - [x] normalise dashes
  - [x] improve prompt regarding units by allowing only a subset of units explicitly
  - [x] experiment with agentic loop.
- Experimented with a hard coded second try (as opposed to a proper agentic loop). Results are primising. Out of 50 recipes, 50 recipes are passing validation
  - This is almost too good to be true. I'll have to review the diffs to ensure nothing is being missed.

# 2025-11-03
- TODO:
  - [ ] Re-run the script with the 50 recipes and review the diffs
  - [ ] Prepare to merge some of the work, I have a lot of pending changes
  - [ ] Decide whether the templatisation is done upstream or downstream of CAPI
