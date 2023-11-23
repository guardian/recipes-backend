import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {StaticBucketName as Bucket, FastlyApiKey} from "./config";
import {sendFastlyPurgeRequestWithRetries} from "../../../lib/recipes-data/src/lib/fastly";

const s3client = new S3Client({region: process.env["AWS_REGION"]});

export async function importNewData(content:unknown):Promise<void>
{
  const req = new PutObjectCommand({
    Bucket,
    Key: "curation.json",
    Body: JSON.stringify(content),
    ContentType: "application/json",
    CacheControl: "max-age=3600; stale-while-revalidate=10; stale-if-error=300"
  });

  console.log("Uploading new curation data...");
  await s3client.send(req);
  console.log("Done. Flushing CDN cache...");
  await sendFastlyPurgeRequestWithRetries("content.json", FastlyApiKey, "hard");
}
