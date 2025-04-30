#!/usr/bin/env bash

#node /printable-recipe-generator/main.js "$1"

#log the recipe UUID and checksum ID
echo "RECIPE UUID is $RECIPE_UID"
echo "CHECKSUM ID is $RECIPE_CSID"
echo "CONTENT is $CONTENT"

#Put json content into file
echo "Write content into a file.."
RECIPE_CONTENT_PATH="/tmp/recipe.json"
echo "$CONTENT" > "$RECIPE_CONTENT_PATH"
echo "Recipe json is saved in the path $RECIPE_CONTENT_PATH"

#Run the renderer on that file
echo "Render the json to html.."
RECIPE_HTML_OUTPUT="/tmp/recipe.html"
node /printable-recipe-generator/main.js "$RECIPE_CONTENT_PATH" "$RECIPE_HTML_OUTPUT"
echo "Recipe html is rendered at $RECIPE_HTML_OUTPUT"

