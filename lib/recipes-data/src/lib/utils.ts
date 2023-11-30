import {createHash} from "crypto";
import type {CapiDateTime} from "@guardian/content-api-models/v1/capiDateTime";
import {parseISO} from "date-fns";
import Int64 from "node-int64";
import {RetryDelaySeconds} from "./config";
import type {RecipeReference, RecipeReferenceWithoutChecksum} from './models';

/**
 * Returns a Promise that resolves after the time specified in the config parameter RETRY_DELAY. Defaults to 1s if the
 * parameter is not set.
 */
export async function awaitableDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, RetryDelaySeconds * 1000));
}

export function calculateChecksum(src: RecipeReferenceWithoutChecksum): RecipeReference {
  const hasher = createHash('sha256');
  hasher.update(src.jsonBlob);
  const checksum = hasher.digest("base64url");  //base64 encoding should be more byte-efficient

  return {...src, checksum,};
}

export function makeCapiDateTime(from: string): CapiDateTime {
  const date = parseISO(from);
  const int64Format = new Int64(date.getTime());
  return {
    dateTime: int64Format,
    iso8601: date.toISOString()
  }
}

/**
 * Returns new Date().  Why? So we can mock it out easily in testing.
 */
export function nowTime():Date {
  return new Date();
}

