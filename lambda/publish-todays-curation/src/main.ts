import type { S3Event } from 'aws-lambda';
import { formatISO } from 'date-fns';
import {
	getContentPrefix,
	getFastlyApiKey,
	getStaticBucketName,
} from 'lib/recipes-data/src/lib/config';
import { Today } from './config';
import {
	activateCuration,
	checkCurationPath,
	doesCurationPathMatch,
	validateAllCuration,
} from './curation';

/**
 * Check if an upload consists of an update for today's curation data. If so, then activate it
 * immediately.
 * @param event
 */
async function handleS3Event(
	event: S3Event,
	contentPrefix: string,
	staticBucketName: string,
	fastlyApiKey: string,
): Promise<void> {
	const toWaitFor = event.Records.map((rec) => {
		if (rec.s3.bucket.name !== staticBucketName) {
			console.log(`Event was for bucket ${rec.s3.bucket.name}, ignoring`);
			return;
		}

		if (rec.eventName != 'ObjectCreated:Put') {
			console.log(
				`Event was for ${rec.eventName} not ObjectCreated:Put, ignoring`,
			);
			return;
		}

		const targetPath = decodeURIComponent(rec.s3.object.key);
		const info = checkCurationPath(targetPath);
		if (info) {
			if (doesCurationPathMatch(info, Today)) {
				console.log(
					`Detected an update of today's curation data for ${info.edition}/${info.front}, redeploying`,
				);
				return activateCuration(
					info,
					contentPrefix,
					staticBucketName,
					fastlyApiKey,
				);
			} else {
				console.log(
					`Detected an update of curation data for ${info.edition}/${info.front} on ${info.year}-${info.month}-${info.day}`,
				);
			}
		} else {
			console.log(`Event was for unrecognised path ${targetPath}`);
		}
	});

	const promises = toWaitFor.filter((maybePromise) => !!maybePromise) as Array<
		Promise<void>
	>;
	await Promise.all(promises);
}

/**
 * Activate the fronts for a given date
 * @param date Date to activate
 */
async function handleTimerEvent(
	date: Date,
	contentPrefix: string,
	staticBucketName: string,
	fastlyApiKey: string,
): Promise<void> {
	console.log(`Checking we have curation for ${formatISO(date)}...`);
	//Check if we have curation available for the new date
	const curations = await validateAllCuration(date, false, staticBucketName);
	if (curations.length == 0) {
		console.error(`No curation data was available for date ${formatISO(date)}`);
	} else {
		console.log(`Activating ${curations.length} fronts...`);
		await Promise.all(
			curations.map((curation) =>
				activateCuration(
					curation,
					contentPrefix,
					staticBucketName,
					fastlyApiKey,
				),
			),
		);
		console.log('Done.');
	}
}

export async function handler(event: unknown) {
	const staticBucketName = getStaticBucketName();
	const contentPrefix = getContentPrefix();
	const fastlyApiKey = getFastlyApiKey();
	// eslint-disable-next-line no-prototype-builtins -- hasOwnProperty is valid here
	if ((event as NonNullable<unknown>).hasOwnProperty('Records')) {
		console.log('Invoked from S3');
		return handleS3Event(
			event as S3Event,
			contentPrefix,
			staticBucketName,
			fastlyApiKey,
		);
	} else {
		console.log('Did not receive an S3 record, assuming invoked from timer');
		return handleTimerEvent(
			Today,
			contentPrefix,
			staticBucketName,
			fastlyApiKey,
		);
	}
}
