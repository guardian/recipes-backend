import {CopyObjectCommand, HeadObjectCommand, NoSuchKey, S3Client, S3ServiceException} from "@aws-sdk/client-s3";
import {format, formatISO} from "date-fns";
import {Bucket} from "./config";

const s3Client = new S3Client({region: process.env["AWS_REGION"]});

export interface CurationPath {
  region: string;
  variant: string;
  year: number;
  month: number;
  day: number;
}

const KnownRegions = [
  "northern-hemisphere",
  "southern-hemisphere"
];

const KnownVariants = [
  "meat-free",
  "all-recipes"
];

const DateFormat = "yyyy-MM-dd";

export async function validateAllCuration(date:Date, throwOnAbsent:boolean):Promise<CurationPath[]> {
  const promises = KnownRegions.flatMap((region)=>
    KnownVariants.map(async (variant) => {
      const maybeInfo = await validateCurationData(region, variant, date);
      if (!maybeInfo) {
        console.warn(`No curation was present for region ${region} variant ${variant} on date ${format(date, DateFormat)}`);
        if (throwOnAbsent) throw new Error(`Missing some curation for ${format(date, DateFormat)}. Consult the logs for more detail.`);
      }
      return maybeInfo;
    }
  ));

  const allCurations = await Promise.all(promises);
  return allCurations.filter((c)=>!!c) as CurationPath[];
}

export function generatePath(region:string, variant:string, date:Date) {
  return `${region}/${variant}/${format(date, DateFormat)}/curation.json`;
}

function zeroPad(num:number, places:number) {
  return String(num).padStart(places, '0');
}

export function generatePathFromCuration(info:CurationPath) {
  return `${info.region}/${info.variant}/${zeroPad(info.year,4)}-${zeroPad(info.month, 2)}-${zeroPad(info.day, 2)}/curation.json`;
}

export function generateActivePath(region:string, variant: string) {
  return `${region}/${variant}/curation.json`;
}

export function doesCurationPathMatch(p:CurationPath, d:Date):boolean {
  //Remember that Javascript dates have Jan=month 0, Feb=month 1 etc.! Hence the +1.
  return (p.year==d.getFullYear()) && (p.month==d.getMonth()+1) && (p.day==d.getDate());
}

const PathMatcher = /^([^/]+)\/([^/]+)\/(\d{4})-(\d{2})-(\d{2})\/curation.json/;
export function checkCurationPath(key:string):CurationPath|null {
  const parts = PathMatcher.exec(key);
  if(parts) {
    return {
      region: parts[1],
      variant: parts[2],
      year: parseInt(parts[3]),
      month: parseInt(parts[4]),
      day: parseInt(parts[5])
    }
  } else {
    return null;
  }
}

export function newCurationPath(region:string, variant:string, date:Date):CurationPath {
  return {
    region,
    variant,
    year: date.getFullYear(),
    month: date.getMonth()+1,
    day: date.getDate(),
  }
}

export async function validateCurationData(region:string, variant:string, date:Date):Promise<CurationPath|null> {
  const req = new HeadObjectCommand({
    Bucket,
    Key: generatePath(region, variant, date),
  });

  try {
    await s3Client.send(req); //this should throw an exception if the file does not exist
    console.debug(`Found curation data for ${region}/${variant} on ${formatISO(date)}`);
    return {
      variant,
      region,
      year: date.getFullYear(),
      month: date.getMonth()+1,
      day: date.getDate()
    };
  } catch(err) {
    if(err instanceof NoSuchKey) {
      console.debug(`Did not find curation data for ${region}/${variant} on ${formatISO(date)}`);
      return null;
    } else {
      console.error(err);
      throw err;
    }
  }
}

export async function activateCuration(info:CurationPath):Promise<void> {
  console.log(`Deploying config ${generatePathFromCuration(info)} to ${generateActivePath(info.region, info.variant)}`);

  const req = new CopyObjectCommand({
    Bucket,
    CopySource: generatePathFromCuration(info),
    Key: generateActivePath(info.region, info.variant)
  });

  const response = await s3Client.send(req);
  console.log(`Done, new Etag is ${response.CopyObjectResult?.ETag ?? "(unknown)"}`);
}

export async function activateAllCurationForDate(date: Date): Promise<void> {
  for (const region of KnownRegions) {
    for (const variant of KnownVariants) {
      try {
        const p = newCurationPath(region, variant, date);
        await activateCuration(p);
      } catch(err) {
        console.warn(`Unable to activate curation for ${region}/${variant} on ${formatISO(date)}: `, err);
      }
    }
  }
}
