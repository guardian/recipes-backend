import {RetryDelaySeconds} from "./config";

/**
 * Returns a Promise that resolves after the time specified in the config parameter RETRY_DELAY. Defaults to 1s if the
 * parameter is not set.
 */
export async function awaitableDelay():Promise<void> {
  return new Promise((resolve)=>setTimeout(resolve, RetryDelaySeconds*1000));
}
