import {CopyObjectCommand, HeadObjectCommand, NoSuchKey, S3Client, S3ServiceException} from "@aws-sdk/client-s3";
import {format} from "date-fns";
import {Bucket} from "./config";

const s3Client = new S3Client({region: process.env["AWS_REGION"]});

const KnownRegions = [
  "northern-hemisphere",
  "southern-hemisphere"
];

const KnownVariants = [
  "meat-free",
  "all-recipes"
];

const DateFormat = "yyyy-MM-dd";

export async function validateAllCuration(date:Date, throwOnAbsent:boolean) {
  for(const region in KnownRegions) {
    for(const variant in KnownVariants) {
      const present = await validateCurationData(region, variant, date);
      if(!present) {
        console.warn(`No curation was present for region ${region} variant ${variant} on date ${format(date, DateFormat)}`);
        if(throwOnAbsent) throw new Error(`Missing some curation for ${format(date, DateFormat)}. Consult the logs for more detail.`)
      }
    }
  }
}

export function generatePath(region:string, variant:string, date:Date) {
  return `${region}/${variant}/${format(date, DateFormat)}/curation.json`;
}

export function generateActivePath(region:string, variant: string) {
  return `${region}/${variant}/curation.json`;
}

interface CurationPath {
  region: string;
  variant: string;
  year: number;
  month: number;
  day: number;
}

export function doesCurationPathMatch(p:CurationPath, d:Date):boolean {
  //Remember that Javascript dates have Jan=month 0, Feb=month 1 etc.! Hence the +1.
  return (p.year==d.getFullYear()) && (p.month==d.getMonth()+1) && (p.day==d.getDate());
}

const PathMatcher = /^([^\/]+)\/([^\/]+)\/(\d{4})-(\d{2})-(\d{2})\/curation.json/;
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

export async function validateCurationData(region:string, variant:string, date:Date):Promise<boolean> {
  const req = new HeadObjectCommand({
    Bucket,
    Key: generatePath(region, variant, date),
  });

  try {
    await s3Client.send(req); //this should throw an exception if the file does not exist
    console.debug(`Found curation data for ${region}/${variant} on ${date}`);
    return true;
  } catch(err) {
    if(err instanceof NoSuchKey) {
      console.debug(`Did not find curation data for ${region}/${variant} on ${date}`);
      return false;
    } else {
      console.error(err);
      throw err;
    }
  }
}

export async function activateCurationForDate(region: string, variant: string, date:Date):Promise<void> {
  console.log(`Deploying config ${generatePath(region, variant, date)} to ${generateActivePath(region, variant)}`);

  const req = new CopyObjectCommand({
    Bucket,
    CopySource: generatePath(region, variant, date),
    Key: generateActivePath(region, variant)
  });

  const response = await s3Client.send(req);
  console.log(`Done, new Etag is ${response.CopyObjectResult?.ETag}`);
}

export async function activateAllCurationForDate(date: Date): Promise<void> {
  for (const region in KnownRegions) {
    for (const variant in KnownVariants) {
      try {
        await activateCurationForDate(region, variant, date);
      } catch(err) {
        console.warn(`Unable to activate curation for ${region}/${variant} on ${date}: `, err);
      }
    }
  }
}
