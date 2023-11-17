import {createHash} from "crypto";
import type {CapiDateTime} from "@guardian/content-api-models/v1/capiDateTime";
import formatISO from 'date-fns/formatISO';
import type Int64 from "node-int64"; //Changes done in tsconfig.json as well to run this package and also made "makeCapiDateTime" as default export
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
  return {
    dateTime: date.getTime().valueOf() as unknown as Int64,// TODO: need to confirm if this is correct approach? In debugging, we can see convresion is happening as expected, example webPublicationDate = { "dateTime": 1515171618000, "iso8601": "2018-01-05T17:00:18Z"}
    iso8601: formatISO(date)
  }
}

export {makeCapiDateTime}
