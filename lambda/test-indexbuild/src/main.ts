import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import type {Handler} from "aws-lambda";
import {type RecipeIndex, retrieveIndexData} from "@recipes-api/lib/recipes-data";
import {INDEX_JSON, V2_INDEX_JSON} from "../../recipes-responder/src/constant";
import {StaticBucketName as Bucket} from "./config";


const dynamoClient = new DynamoDBClient({region: process.env["AWS_REGION"]});
const s3Client = new S3Client({region: process.env["AWS_REGION"]});

async function writeIndexData(indexData: RecipeIndex, key: string) {
  console.log("Marshalling data...");
  const formattedData = JSON.stringify(indexData);

  console.log("Done. Writing to S3...");
  const req = new PutObjectCommand({
    Bucket,
    Key: key,
    Body: formattedData,
    ContentType: "application/json",
    //TODO: set up cache control
  });

  await s3Client.send(req);
  console.log("Done.")
}

export const handler: Handler = async () => {
  console.log("Index test starting up");

  console.log("Retrieving index data...");
  const indexDataForUnSponsoredRecipes = await retrieveIndexData(true);
  const indexDataForAllRecipes = await retrieveIndexData(false);
  console.log("Done.")
  await writeIndexData(indexDataForUnSponsoredRecipes, INDEX_JSON);
  await writeIndexData(indexDataForAllRecipes, V2_INDEX_JSON);
  console.log("All completed.");
}
