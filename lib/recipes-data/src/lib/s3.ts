import * as process from "process";
import {DeleteObjectCommand, NoSuchKey, PutObjectCommand, S3Client, S3ServiceException} from "@aws-sdk/client-s3";
import {StaticBucketName as Bucket, FastlyApiKey, MaximumRetries} from "./config";
import {sendFastlyPurgeRequestWithRetries} from "./fastly";
import type { RecipeReference } from './models';
import {awaitableDelay} from "./utils";

const s3Client = new S3Client({region: process.env["AWS_REGION"]});


/**
 * Publishes the given recipe data into the output bucket.
 *
 * S3 errors are automatically retried with a delay, as configured by the MAX_RETRIES & RETRY_DELAY parameters
 *
 * @param recipe data structure giving the uid, json content and the checksum
 * @param attempt used internally to track retries
 * @return a promise which resolves to void on success or errors on failure
 */
export async function publishRecipeContent(recipe: RecipeReference, attempt?: number):Promise<void>
{
  const realAttempt = attempt ?? 1;
  if(!recipe.checksum) {
    throw new Error("publishRecipeContent: Cannot output recipe data without a checksum");
  }

  const Key = `content/${recipe.checksum}`;

  const req = new PutObjectCommand({
    Bucket,
    Key,
    Body: recipe.jsonBlob,
    ContentType: "application/json",
    ChecksumSHA256: recipe.checksum,
    CacheControl: "max-age=31557600; stale-while-revalidate=60; stale-if-error=300"
  });

  try {
    await s3Client.send(req);
    //TODO - check if "hard" or "soft" purging is the right option here
    await sendFastlyPurgeRequestWithRetries(Key, FastlyApiKey ?? "", "hard");
  } catch(err) {
    if (err instanceof S3ServiceException) {
      console.warn(`Unable to write to S3 on attempt ${realAttempt}: `, err);
      if(MaximumRetries && !isNaN(MaximumRetries) && realAttempt < MaximumRetries) {
        await awaitableDelay();
        return publishRecipeContent(recipe, realAttempt+1);
      } else {
        throw new Error("Could not write to S3, see logs for details.")
      }
    } else {
      throw err;
    }
  }
}

export async function removeRecipeContent(recipeSHA: string, attempt?: number): Promise<void>
{
  const realAttempt = attempt ?? 1;

  const Key = `content/${recipeSHA}`;
  const req = new DeleteObjectCommand({
    Bucket,
    Key,
  });

  try {
    await s3Client.send(req);
    await sendFastlyPurgeRequestWithRetries(Key, FastlyApiKey ?? "", "hard");
  } catch(err) {
    if(err instanceof NoSuchKey) {
      console.log(`removeRecipeContent: No recipe existed at version ${recipeSHA} so I could not remove it.`);
      return;
    } else if(err instanceof S3ServiceException) {
      console.warn(`Unable to delete from S3 on attempt ${realAttempt}: `, err);
      if(MaximumRetries && !isNaN(MaximumRetries) && realAttempt < MaximumRetries) {
        await awaitableDelay();
        return removeRecipeContent(recipeSHA, realAttempt+1);
      } else {
        throw new Error("Could not delete from S3, see logs for details.")
      }
    } else {
      throw err;
    }
  }
}
