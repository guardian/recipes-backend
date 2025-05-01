#!/usr/bin/env bash

#node /printable-recipe-generator/main.js "$1"

#log the recipe UUID and checksum ID
echo "RECIPE UUID is $RECIPE_UID"
echo "CHECKSUM ID is $RECIPE_CSID"
echo "CONTENT is $CONTENT"

id
ls -lhd /tmp
ls -lh /tmp
mount
ulimit -a

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

#Convert htmlfile to PDF file
echo "Take html and convert it to PDF using headless chrome"
RECIPE_PDF_OUTPUT='/tmp/recipe.pdf'
google-chrome-stable --headless --disable-gpu --no-sandbox --disable-plugins --enable-logging --v=1 --print-to-pdf="$RECIPE_PDF_OUTPUT" "$RECIPE_HTML_OUTPUT"
echo "Recipe PDF is generated at $RECIPE_PDF_OUTPUT"

#Copy PDF file to S3
echo "Copy recipe.pdf file to S3 now"
RECIPE_PDF_S3_OUTPUT="s3://${BUCKET}/content/${RECIPE_CSID}.pdf"
aws s3 cp "$RECIPE_PDF_OUTPUT" "$RECIPE_PDF_S3_OUTPUT"
echo "Recipe PDF is uploaded to S3 bucket at $RECIPE_PDF_S3_OUTPUT"

