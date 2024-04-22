import {Context, S3Event} from "aws-lambda";
import {
  activateAllCurationForDate, activateCurationForDate, checkCurationPath, doesCurationPathMatch,
  validateAllCuration,
} from "./curation";
import {Bucket, Today} from "./config";

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
        return activateCurationForDate(info.region, info.variant, Today);
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
  console.log(`Checking we have curation for ${date}...`)
  //Check if we have curation available for the new date
  await validateAllCuration(date, false);
  console.log(`Activating...`);
  await activateAllCurationForDate(date);
  console.log("Done.");
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
