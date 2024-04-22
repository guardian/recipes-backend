import type {Context, S3Event} from "aws-lambda";
import {formatISO} from "date-fns";
import {Bucket, Today} from "./config";
import {
  activateAllCurationForDate,
  activateCuration, checkCurationPath, doesCurationPathMatch,
  validateAllCuration,
} from "./curation";

/**
 * Check if an upload consists of an update for today's curation data. If so, then activate it
 * immediately.
 * @param event
 */
async function handleS3Event(event:S3Event):Promise<void> {
  const toWaitFor = event.Records.map((rec)=>{
    if(rec.s3.bucket.name != Bucket) {
      console.log(`Event was for bucket ${rec.s3.bucket.name}, ignoring`);
      return;
    }

    const info = checkCurationPath(rec.s3.object.key);
    if(info) {
      if(doesCurationPathMatch(info, Today)) {
        console.log(`Detected an update of today's curation data for ${info.region}/${info.variant}, redeploying`);
        return activateCuration(info);
      } else {
        console.log(`Detected an update of curation data for ${info.region}/${info.variant} on ${info.year}-${info.month}-${info.day}`);
      }
    } else {
      console.log(`Event was for unrecognised path ${rec.s3.object.key}`);
    }
  });

  await Promise.all(toWaitFor.filter((maybePromise)=>!!maybePromise));
}

/**
 * Activate the fronts for a given date
 * @param date Date to activate
 */
async function handleTimerEvent(date: Date):Promise<void> {
  console.log(`Checking we have curation for ${formatISO(date)}...`)
  //Check if we have curation available for the new date
  const curations= await validateAllCuration(date, false);
  if(curations.length==0) {
    console.error(`No curation data was available for date ${formatISO(date)}`);
  } else {
    console.log(`Activating ${curations.length} fronts...`);
    await activateAllCurationForDate(date);
    console.log("Done.");
  }
}



async function handler(event: S3Event|unknown, context: Context) {
  if((event as {}).hasOwnProperty("Records")) {
    console.log("Invoked from S3");
    return handleS3Event(event as S3Event)
  } else {
    console.log("Did not receive an S3 record, assuming invoked from timer");
    return handleTimerEvent(new Date());
  }
}
