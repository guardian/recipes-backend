import {createHash} from "crypto";
import {RetryDelaySeconds} from "./config";
import type {RecipeReference, RecipeReferenceWithoutChecksum} from './models';

/**
 * Returns a Promise that resolves after the time specified in the config parameter RETRY_DELAY. Defaults to 1s if the
 * parameter is not set.
 */
export async function awaitableDelay():Promise<void> {
  return new Promise((resolve)=>setTimeout(resolve, RetryDelaySeconds*1000));
}

export function calculateChecksum(src:RecipeReferenceWithoutChecksum):RecipeReference {
  const hasher = createHash('sha256');
  hasher.update(src.jsonBlob);
  const checksum = hasher.digest("base64url");  //base64 encoding should be more byte-efficient

  return {...src, checksum,};
}
