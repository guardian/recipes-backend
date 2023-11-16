import {DynamoDBClient} from "@aws-sdk/client-dynamodb";

export const DynamoClient = new DynamoDBClient({region: process.env["AWS_REGION"]});
