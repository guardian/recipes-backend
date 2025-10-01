-- Recipe Data Quality - Normalized Table Structure
-- This script creates normalized tables and migrates data from recipe_raw

-- Drop existing tables if they exist
DROP TABLE IF EXISTS instructions;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS recipes;

-- Create recipes table
CREATE TABLE recipes (
    recipe_id TEXT UNIQUE NOT NULL,  -- Original recipe ID from JSON
    title TEXT NOT NULL,
    description TEXT,
    difficulty_level TEXT,
    book_credit TEXT,
    canonical_article TEXT,
    composer_id TEXT,

    -- Image information (as JSON for flexibility)
    featured_image_url TEXT,
    featured_image_caption TEXT,
    featured_image_photographer TEXT,
    preview_image_url TEXT,

    -- Serves information (simplified)
    serves_min INTEGER,
    serves_max INTEGER,
    serves_text TEXT,

    -- Timing information (as arrays stored as JSON)
    timings JSON,  -- Array of timing objects

    -- Diet and meal type information (as arrays)
    cuisine_ids JSON,  -- Array of cuisine IDs
    meal_type_ids JSON,  -- Array of meal type IDs
    suitable_for_diet_ids JSON,  -- Array of diet IDs
    celebration_ids JSON,  -- Array of celebration IDs
    techniques_used_ids JSON,  -- Array of technique IDs
    utensils_and_appliance_ids JSON,  -- Array of utensil/appliance IDs

    -- Contributors and other metadata
    contributors JSON,  -- Array of contributor profiles
    byline JSON,  -- Array of byline information
    commerce_ctas JSON,  -- Array of commerce CTAs

    -- Dates
    first_published_date TEXT,
    last_modified_date TEXT,
    published_date TEXT,

    -- App readiness flag
    is_app_ready BOOLEAN DEFAULT FALSE
);

-- Create ingredients table
CREATE TABLE ingredients (
    recipe_id TEXT NOT NULL,
    recipe_section TEXT,  -- e.g., "For the sumac onions"
    ingredient_order INTEGER,  -- Order within the section

    -- Core ingredient data
    name TEXT,
    text TEXT,  -- Full text as it appears

    -- Amount information
    amount_min REAL,
    amount_max REAL,
    unit TEXT,

    -- Additional properties
    prefix TEXT,  -- e.g., "large", "tin"
    suffix TEXT,  -- e.g., "peeled and chopped"
    optional BOOLEAN DEFAULT FALSE,
    empty_amount_is_ok BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id)
);

-- Create instructions table
CREATE TABLE instructions (
    recipe_id TEXT NOT NULL,
    step_number INTEGER,
    description TEXT,

    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id)
);

-- Create indexes for better performance
CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX idx_instructions_recipe_id ON instructions(recipe_id);
CREATE INDEX idx_recipes_recipe_id ON recipes(recipe_id);

-- Migration script to populate normalized tables from recipe_raw
INSERT INTO recipes (
    recipe_id, title, description, difficulty_level, book_credit,
    canonical_article, composer_id, featured_image_url, featured_image_caption,
    featured_image_photographer, preview_image_url, serves_min, serves_max,
    serves_text, timings, cuisine_ids, meal_type_ids, suitable_for_diet_ids,
    celebration_ids, techniques_used_ids, utensils_and_appliance_ids,
    contributors, byline, commerce_ctas, first_published_date,
    last_modified_date, published_date, is_app_ready
)
SELECT
    json_extract(json_data, '$.id') as recipe_id,
    json_extract(json_data, '$.title') as title,
    json_extract(json_data, '$.description') as description,
    json_extract(json_data, '$.difficultyLevel') as difficulty_level,
    json_extract(json_data, '$.bookCredit') as book_credit,
    json_extract(json_data, '$.canonicalArticle') as canonical_article,
    json_extract(json_data, '$.composerId') as composer_id,
    json_extract(json_data, '$.featuredImage.url') as featured_image_url,
    json_extract(json_data, '$.featuredImage.caption') as featured_image_caption,
    json_extract(json_data, '$.featuredImage.photographer') as featured_image_photographer,
    json_extract(json_data, '$.previewImage.url') as preview_image_url,
    json_extract(json_data, '$.serves[0].amount.min') as serves_min,
    json_extract(json_data, '$.serves[0].amount.max') as serves_max,
    json_extract(json_data, '$.serves[0].text') as serves_text,
    json_extract(json_data, '$.timings') as timings,
    json_extract(json_data, '$.cuisineIds') as cuisine_ids,
    json_extract(json_data, '$.mealTypeIds') as meal_type_ids,
    json_extract(json_data, '$.suitableForDietIds') as suitable_for_diet_ids,
    json_extract(json_data, '$.celebrationIds') as celebration_ids,
    json_extract(json_data, '$.techniquesUsedIds') as techniques_used_ids,
    json_extract(json_data, '$.utensilsAndApplianceIds') as utensils_and_appliance_ids,
    json_extract(json_data, '$.contributors') as contributors,
    json_extract(json_data, '$.byline') as byline,
    json_extract(json_data, '$.commerceCtas') as commerce_ctas,
    json_extract(json_data, '$.firstPublishedDate') as first_published_date,
    json_extract(json_data, '$.lastModifiedDate') as last_modified_date,
    json_extract(json_data, '$.publishedDate') as published_date,
    CASE
        WHEN json_extract(json_data, '$.isAppReady') = 'true' THEN 1
        ELSE 0
    END as is_app_ready
FROM recipe_raw;

-- Migrate ingredients data
-- This uses a recursive CTE to handle the nested structure of ingredients
WITH RECURSIVE ingredient_sections AS (
    SELECT
        json_extract(json_data, '$.id') as recipe_id,
        json_extract(json_data, '$.ingredients') as ingredients_json,
        0 as section_idx,
        json_array_length(json_extract(json_data, '$.ingredients')) as section_count
    FROM recipe_raw
    WHERE json_extract(json_data, '$.ingredients') IS NOT NULL

    UNION ALL

    SELECT
        recipe_id,
        ingredients_json,
        section_idx + 1,
        section_count
    FROM ingredient_sections
    WHERE section_idx < section_count - 1
),
ingredient_items AS (
    SELECT
        is_sections.recipe_id,
        json_extract(is_sections.ingredients_json, '$[' || is_sections.section_idx || '].recipeSection') as recipe_section,
        json_extract(is_sections.ingredients_json, '$[' || is_sections.section_idx || '].ingredientsList') as ingredients_list,
        0 as item_idx,
        json_array_length(json_extract(is_sections.ingredients_json, '$[' || is_sections.section_idx || '].ingredientsList')) as item_count
    FROM ingredient_sections is_sections
    WHERE json_extract(is_sections.ingredients_json, '$[' || is_sections.section_idx || '].ingredientsList') IS NOT NULL

    UNION ALL

    SELECT
        recipe_id,
        recipe_section,
        ingredients_list,
        item_idx + 1,
        item_count
    FROM ingredient_items
    WHERE item_idx < item_count - 1
)
INSERT INTO ingredients (
    recipe_id, recipe_section, ingredient_order, name, text,
    amount_min, amount_max, unit, prefix, suffix, optional, empty_amount_is_ok
)
SELECT
    ii.recipe_id,
    ii.recipe_section,
    ii.item_idx + 1 as ingredient_order,
    json_extract(ii.ingredients_list, '$[' || ii.item_idx || '].name') as name,
    json_extract(ii.ingredients_list, '$[' || ii.item_idx || '].text') as text,
    CAST(json_extract(ii.ingredients_list, '$[' || ii.item_idx || '].amount.min') AS REAL) as amount_min,
    CAST(json_extract(ii.ingredients_list, '$[' || ii.item_idx || '].amount.max') AS REAL) as amount_max,
    json_extract(ii.ingredients_list, '$[' || ii.item_idx || '].unit') as unit,
    json_extract(ii.ingredients_list, '$[' || ii.item_idx || '].prefix') as prefix,
    json_extract(ii.ingredients_list, '$[' || ii.item_idx || '].suffix') as suffix,
    CASE
        WHEN json_extract(ii.ingredients_list, '$[' || ii.item_idx || '].optional') = 'true' THEN 1
        ELSE 0
    END as optional,
    CASE
        WHEN json_extract(ii.ingredients_list, '$[' || ii.item_idx || '].emptyAmountIsOk') = 'true' THEN 1
        ELSE 0
    END as empty_amount_is_ok
FROM ingredient_items ii;

-- Migrate instructions data
WITH RECURSIVE instruction_steps AS (
    SELECT
        json_extract(json_data, '$.id') as recipe_id,
        json_extract(json_data, '$.instructions') as instructions_json,
        0 as step_idx,
        json_array_length(json_extract(json_data, '$.instructions')) as step_count
    FROM recipe_raw
    WHERE json_extract(json_data, '$.instructions') IS NOT NULL

    UNION ALL

    SELECT
        recipe_id,
        instructions_json,
        step_idx + 1,
        step_count
    FROM instruction_steps
    WHERE step_idx < step_count - 1
)
INSERT INTO instructions (recipe_id, step_number, description)
SELECT
    is_steps.recipe_id,
    is_steps.step_idx + 1 as step_number,
    json_extract(is_steps.instructions_json, '$[' || is_steps.step_idx || '].description') as description
FROM instruction_steps is_steps;

-- Display summary of migrated data
SELECT 'Migration Summary:' as summary;
SELECT 'Recipes migrated: ' || COUNT(*) as count FROM recipes;
SELECT 'Ingredients migrated: ' || COUNT(*) as count FROM ingredients;
SELECT 'Instructions migrated: ' || COUNT(*) as count FROM instructions;
