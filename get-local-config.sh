#!/bin/bash -e

if [ "$STAGE" == "" ]; then
  STAGE=CODE
fi

STACK_NAME=$(aws cloudformation describe-stacks --query 'Stacks[?Tags[?Key == `App` && Value == `recipes-backend`] && Tags[?Key == `Stage` && Value == `'$STAGE'`]].{StackName: StackName}' --output text)

if [ "$STACK_NAME" == "" ]; then
  echo No stack was found, check you have the right permissions and are looking at the right region. Looking for App=recipes-backend and Stage=${STAGE}
  exit 1
fi

echo Found stack "$STACK_NAME"

LAMBDA_FUNCTION=$(aws cloudformation describe-stack-resources --stack-name $STACK_NAME --query 'StackResources[?ResourceType == `AWS::Lambda::Function` && starts_with(LogicalResourceId, `updater`)]' | jq -r '.[].PhysicalResourceId')

if [ "$LAMBDA_FUNCTION" == "" ]; then
  echo Could not find updater lambda in the stack definition.  These are the lambdas available:
  aws cloudformation describe-stack-resources --stack-name content-api-CODE-recipes-backend --query 'StackResources[?ResourceType == `AWS::Lambda::Function`]'
  exit 2
fi

echo Found lambda function "$LAMBDA_FUNCTION". Outputting environment...
aws lambda get-function --function-name "$LAMBDA_FUNCTION" --query 'Configuration.Environment.Variables' | perl -n -e'/\"([\w_]+)\": \"(.+)\"/ && print "export $1=$2\n"' | grep -v TELEMETRY > "environ-${STAGE}"

echo You can now run \`source environ-${STAGE}\` to get hold of the environment configuration for $STAGE
