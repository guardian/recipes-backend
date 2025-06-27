#!/bin/bash -e

#log the recipe UUID and checksum ID
echo "RECIPE UUID is $RECIPE_UID"
echo "CHECKSUM ID is $RECIPE_CSID"

#Run the renderer on that file
echo "Render the json to html.."
RECIPE_HTML_OUTPUT="./recipe.html"
node /printable-recipe-generator/main.js "$RECIPE_CSID" "$RECIPE_HTML_OUTPUT"
if [ "$?" != "0" ]; then
  echo ERROR Could not render HTML!
  exit 2
fi
echo "Recipe html is rendered at $RECIPE_HTML_OUTPUT"

#Convert htmlfile to PDF file
echo "Take html and convert it to PDF using headless chrome"
RECIPE_PDF_OUTPUT='./recipe.pdf'
google-chrome-stable --headless --disable-gpu --font-render-hinting=none --no-sandbox --no-pdf-header-footer --print-to-pdf="$RECIPE_PDF_OUTPUT" "$RECIPE_HTML_OUTPUT"
if [ "$?" != "0" ]; then
  echo ERROR Could not render HTML to PDF!
  exit 2
fi
echo "Recipe PDF is generated at $RECIPE_PDF_OUTPUT"

#Copy PDF file to S3
echo "Copy recipe.pdf file to S3 now"
RECIPE_PDF_S3_OUTPUT="s3://${BUCKET}/content/${RECIPE_CSID}.pdf"
aws s3 cp "$RECIPE_PDF_OUTPUT" "$RECIPE_PDF_S3_OUTPUT" --cache-control "max-age=7200, stale-while-revalidate=300, stale-if-error=14400"
if [ "$?" != "0" ]; then
  echo ERROR Could not write to S3!
  exit 2
fi
echo "Recipe PDF is uploaded to S3 bucket at $RECIPE_PDF_S3_OUTPUT"

