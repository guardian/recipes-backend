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
