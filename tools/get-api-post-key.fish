#!/usr/bin/env fish

# Set default STAGE if not set
if test -z "$STAGE"
    set -x STAGE CODE
end

echo "Obtaining key for environment $STAGE..."

# Fetch the parameter and store it in environment variable
set -x RECIPES_API_KEY (aws ssm get-parameter --name /$STAGE/feast/recipes-backend/api-push-key --with-decryption | jq -r .Parameter.Value)

echo "The key should now be in the environment variable RECIPES_API_KEY. If not, ensure you ran `source get-api-post-key.fish`"
