import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { type RecipeIndex, retrieveIndexData } from "@recipes-api/lib/recipes-data";
import type { Handler } from "aws-lambda";
import { StaticBucketName as Bucket } from "./config";


const dynamoClient = new DynamoDBClient({region: process.env["AWS_REGION"]});
const s3Client = new S3Client({region: process.env["AWS_REGION"]});

async function writeIndexData(indexData:RecipeIndex)
{
  console.log("Marshalling data...");
  const formattedData = JSON.stringify(indexData);

  console.log("Done. Writing to S3...");
  const req = new PutObjectCommand({
    Bucket,
    Key: "index.json",
    Body: formattedData,
    ContentType: "application/json",
    //TODO: set up cache control
  });

  await s3Client.send(req);
  console.log("Done.")
}

export const handler:Handler = async ()=>{
  console.log("Index test starting up");

  console.log("Retrieving index data...");
  const indexData = await retrieveIndexData(dynamoClient);
  console.log("Done.")
  await writeIndexData(indexData);
  console.log("All completed.");
}
