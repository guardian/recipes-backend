#!/bin/bash -e

if [ "$STAGE" == "" ]; then
  export STAGE='CODE'
fi

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    echo "You should run this via \`source\` not directly"
    exit 1
fi

echo Obtaining key for environment $STAGE...

export RECIPES_API_KEY=$(aws ssm get-parameter --name /$STAGE/feast/recipes-backend/api-push-key --with-decryption | jq -r .Parameter.Value)

echo The key is now in the environment variable RECIPES_API_KEY
