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
