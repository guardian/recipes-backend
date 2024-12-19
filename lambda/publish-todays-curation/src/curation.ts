import {
	CopyObjectCommand,
	HeadObjectCommand,
	NotFound,
	S3Client,
} from '@aws-sdk/client-s3';
import { format, formatISO } from 'date-fns';
import { sendFastlyPurgeRequestWithRetries } from '@recipes-api/lib/recipes-data';

const s3Client = new S3Client({ region: process.env['AWS_REGION'] });

export interface CurationPath {
	edition: string;
	front: string;
	year: number;
	month: number;
	day: number;
}

const KnownEditions = ['northern', 'southern'];

const KnownFronts = ['meat-free', 'all-recipes'];

const DateFormat = 'yyyy-MM-dd';

export async function validateAllCuration(
	date: Date,
	throwOnAbsent: boolean,
	staticBucketName: string,
): Promise<CurationPath[]> {
	const promises = KnownEditions.flatMap((region) =>
		KnownFronts.map(async (variant) => {
			const maybeInfo = await validateCurationData(
				region,
				variant,
				date,
				staticBucketName,
			);
			if (!maybeInfo) {
				console.warn(
					`No curation was present for region ${region} variant ${variant} on date ${format(
						date,
						DateFormat,
					)}`,
				);
				if (throwOnAbsent) {
					throw new Error(
						`Missing some curation for ${format(
							date,
							DateFormat,
						)}. Consult the logs for more detail.`,
					);
				}
			}
			return maybeInfo;
		}),
	);

	const allCurations = await Promise.all(promises);
	return allCurations.filter((c) => !!c) as CurationPath[];
}

export function generatePath(region: string, variant: string, date: Date) {
	return `${region}/${variant}/${format(date, DateFormat)}/curation.json`;
}

function zeroPad(num: number, places: number) {
	return String(num).padStart(places, '0');
}

export function generatePathFromCuration(info: CurationPath) {
	return `${info.edition}/${info.front}/${zeroPad(info.year, 4)}-${zeroPad(
		info.month,
		2,
	)}-${zeroPad(info.day, 2)}/curation.json`;
}

export function generateActivePath(region: string, variant: string) {
	return `${region}/${variant}/curation.json`;
}

export function doesCurationPathMatch(p: CurationPath, d: Date): boolean {
	//Remember that Javascript dates have Jan=month 0, Feb=month 1 etc.! Hence the +1.
	return (
		p.year == d.getFullYear() &&
		p.month == d.getMonth() + 1 &&
		p.day == d.getDate()
	);
}

const PathMatcher =
	/^([^/]+)\/([^/]+)\/(\d{4})-(\d{2})-(\d{2})\/curation\.json/;
export function checkCurationPath(key: string): CurationPath | null {
	const parts = PathMatcher.exec(key);
	if (parts) {
		return {
			edition: parts[1],
			front: parts[2],
			year: parseInt(parts[3]),
			month: parseInt(parts[4]),
			day: parseInt(parts[5]),
		};
	} else {
		return null;
	}
}

export function newCurationPath(
	region: string,
	variant: string,
	date: Date,
): CurationPath {
	return {
		edition: region,
		front: variant,
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate(),
	};
}

export async function validateCurationData(
	region: string,
	variant: string,
	date: Date,
	staticBucketName: string,
): Promise<CurationPath | null> {
	console.debug(`Checking path `, generatePath(region, variant, date));
	const req = new HeadObjectCommand({
		Bucket: staticBucketName,
		Key: generatePath(region, variant, date),
	});

	try {
		await s3Client.send(req); //this should throw an exception if the file does not exist
		console.debug(
			`Found curation data for ${region}/${variant} on ${formatISO(date)}`,
		);
		return {
			front: variant,
			edition: region,
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			day: date.getDate(),
		};
	} catch (err) {
		if (err instanceof NotFound) {
			console.debug(
				`Did not find curation data for ${region}/${variant} on ${formatISO(
					date,
				)}`,
			);
			return null;
		} else {
			console.error(err);
			throw err;
		}
	}
}

export async function activateCuration(
	info: CurationPath,
	contentPrefix: string,
	staticBucketName: string,
	fastlyApiKey: string,
): Promise<void> {
	const targetPath = generateActivePath(info.edition, info.front);
	console.log(
		`Deploying config ${generatePathFromCuration(info)} to ${targetPath}`,
	);

	const req = new CopyObjectCommand({
		Bucket: staticBucketName,
		CopySource: staticBucketName + '/' + generatePathFromCuration(info),
		Key: targetPath,
	});

	const response = await s3Client.send(req);
	console.log(
		`Done, new Etag is ${response.CopyObjectResult?.ETag ?? '(unknown)'}`,
	);
	await sendFastlyPurgeRequestWithRetries({
		contentPath: targetPath,
		apiKey: fastlyApiKey,
		contentPrefix,
	});
}
