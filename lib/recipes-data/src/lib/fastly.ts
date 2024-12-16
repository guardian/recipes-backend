//This file is based on https://github.com/guardian/fastly-cache-purger/blob/5b718fd827acf2eabb94884d9df59645999fc2f5/src/main/scala/com/gu/fastly/Lambda.scala#L162
//with reference to https://developer.fastly.com/reference/api/purging/ and https://docs.fastly.com/en/guides/authenticating-api-purge-requests
import { DebugLogsEnabled, MaximumRetries } from './config';
import { awaitableDelay } from './utils';

/** From the fastly docs at https://docs.fastly.com/en/fundamentals/what-is-purging:
 *
 * A soft purge invalidates an object and marks it as stale.
 * The next time a user requests the object, they’ll be served the stale object and then the updated
 * object will be retrieved from origin.
 * Stale objects can also be served to client requests even when your origin servers are down.
 *
 * A hard purge permanently invalidates cached objects and makes them unusable for future requests.
 * It forces Fastly to retrieve that object again from your origin servers before it can be re-cached in Fastly POPs.
 */
export type PurgeType = 'hard' | 'soft';

const leadingSlash = /^\/+/;
const trainingSlash = /\/+$/;

export class FastlyError extends Error {}

function removeLeadingAndTrailingSlash(from: string): string {
	return from.replace(leadingSlash, '').replace(trainingSlash, '');
}

/**
 * Make a purge request to Fastly.  The given content will be removed from Fastly's cache and re-requested from origin
 * the next time a client asks for it.
 * This function does not retry; use the `sendFastlyPurgeRequestWithRetries` function for that
 *
 * Note, the CONTENT_URL_BASE parameter must be configured (either in environment variables or via a mock when testing).
 * The function will throw if it is not defined.
 * @param contentPath URL to purge. This is relative to the configured CONTENT_URL_BASE
 * @param apiKey Fastly API key to authenticate the request.  The function will throw if this is undefined or empty.
 * @param purgeType Whether to execute a soft or hard purge (default soft). See the docs on PurgeType for more information.
 */
export async function sendFastlyPurgeRequest({
	contentPath,
	apiKey,
	contentPrefix,
	purgeType,
}: {
	contentPath: string;
	apiKey: string;
	contentPrefix: string;
	purgeType?: PurgeType;
}) {
	if (!apiKey || apiKey == '') {
		throw new Error('Cannot purge because Fastly API key is not set');
	}

	const urlToPurge = [
		'https://api.fastly.com/purge',
		removeLeadingAndTrailingSlash(contentPrefix),
		removeLeadingAndTrailingSlash(contentPath),
	].join('/');

	const baseHeaders: Record<string, string> = {
		'FASTLY-KEY': apiKey,
		Accept: 'application/json',
	};

	const headers =
		purgeType == 'hard'
			? baseHeaders
			: {
					'Fastly-Soft-Purge': '1',
					...baseHeaders,
			  };

	if (DebugLogsEnabled) console.debug('urlToPurge is ', urlToPurge);
	const response = await fetch(urlToPurge, {
		method: 'POST',
		headers,
	});
	const content = await response.text();

	switch (response.status) {
		case 200:
			if (DebugLogsEnabled) {
				console.log(`Purge of ${contentPath} successful: ${content}`);
			}
			break;
		case 404:
			console.warn(
				`Fastly could not purge ${contentPath}, api returned Not Found.`,
			);
			break;
		default:
			console.error(
				`Unable to purge ${contentPath}, Fastly returned ${response.status}: ${content}`,
			);
			throw new FastlyError(`Fastly returned ${response.status}`);
	}
}

/**
 * calls `sendFastlyPurgeRequest` with the given parameters.  If Fastly returns an error, this will delay by the
 * number of seconds given in RETRY_DELAY and then retry, up to a maximum of MAX_RETRIES attempts.
 * @param contentPath URL to purge. This is relative to the configured CONTENT_URL_BASE
 * @param apiKey Fastly API key to authenticate the request.  The function will throw if this is undefined or empty.
 * @param purgeType Whether to execute a soft or hard purge (default soft). See the docs on PurgeType for more information.
 * @param retryCount don't specify this, it's used internally.
 */
export async function sendFastlyPurgeRequestWithRetries({
	contentPath,
	apiKey,
	contentPrefix,
	purgeType,
	retryCount,
}: {
	contentPath: string;
	apiKey: string;
	contentPrefix: string;
	purgeType?: PurgeType;
	retryCount?: number;
}): Promise<void> {
	try {
		return sendFastlyPurgeRequest({
			contentPath,
			apiKey,
			contentPrefix,
			purgeType,
		});
	} catch (err) {
		if (err instanceof FastlyError) {
			const nextRetry = retryCount ? retryCount + 1 : 1;
			if (
				nextRetry > MaximumRetries ||
				!MaximumRetries ||
				isNaN(MaximumRetries)
			) {
				throw err; //we give up! it ain't gonna work.
			}
			await awaitableDelay();
			return sendFastlyPurgeRequestWithRetries({
				contentPath,
				apiKey,
				contentPrefix,
				purgeType,
				retryCount: nextRetry,
			});
		} else {
			throw err;
		}
	}
}
