import {createHash} from "crypto";
import type {CapiDateTime} from "@guardian/content-api-models/v1/capiDateTime";
import formatISO from 'date-fns/formatISO';
import Int64 from "node-int64"; //Changes done in tsconfig.json as well to run this package and also made "makeCapiDateTime" as default export
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

function makeCapiDateTime(from: string): CapiDateTime {
  const date = new Date(from)
  const int64Format = new Int64(date.getTime());
  return {
    dateTime: int64Format,
    iso8601: formatISO(date)
  }
}

export {makeCapiDateTime}


