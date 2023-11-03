import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import type {Handler} from "aws-lambda";

const dynamoClient = new DynamoDBClient({region: process.env["AWS_REGION"]});

export const handler:Handler = ()=>{
  console.log("Hello world");
}
