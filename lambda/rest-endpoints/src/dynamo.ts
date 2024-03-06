import {DynamoDBClient} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({region: process.env["AWS_REGION"]});

