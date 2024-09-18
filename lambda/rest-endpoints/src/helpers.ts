import type { RecipeIndexEntry} from "@recipes-api/lib/recipes-data";
import {multipleRecipesByUid} from "@recipes-api/lib/recipes-data";
import {ProvisionedThroughputExceededException} from "@aws-sdk/client-dynamodb";

export function getBodyContentAsJson(body:unknown): string {
  if(body instanceof Buffer) {
    return body.toString('utf-8')
  } else if(typeof body==='string') {
    JSON.parse(body);
    return body;
  } else if(Array.isArray(body) || typeof body==='object') {
    return JSON.stringify(body);
  } else {
    throw new Error("Did not recognise the body content as json or json-like");
  }
}

export function validateDateParam(dateParam:string):Date|null {
  const checker = /^(\d{4})-(\d{2})-(\d{2})$/;
  const parts = checker.exec(dateParam);

  if(!parts) {
    console.warn(`Provided date argument ${dateParam} is not valid `);
    throw new Error("Provided date was not valid");
  } else {
    const year = parseInt(parts[1]);
    if(year<2024) throw new Error("Invalid year");
    const month = parseInt(parts[2]);
    if(month<1 || month>12) throw new Error("Invalid number of months");
    const day = parseInt(parts[3]);
    if(day<1 || day>31) throw new Error("Invalid number of days");

    return new Date(year,month-1,day);
  }
}

function asyncTimeout(timeout:number) {
  return new Promise((resolve)=>setTimeout(resolve, timeout));
}

export async function recursivelyGetIdList(uidList:string[], prevResults: RecipeIndexEntry[], attempt?:number): Promise<RecipeIndexEntry[]> {
  const batchSize = 50; //ok so this is finger-in-the-air
  const maxAttempts = 10;

  const toLookUp = uidList.slice(0, batchSize);
  try {
    const results = await multipleRecipesByUid(toLookUp);
    if(toLookUp.length==uidList.length) { //we got everything
      return prevResults.concat(results);
    } else {
      return recursivelyGetIdList(uidList.slice(batchSize), prevResults.concat(results), 0)
    }
  } catch(err) {
    console.warn(err);
    if(err instanceof ProvisionedThroughputExceededException) {
      const nextAttempt = attempt ? attempt + 1 : 1;
      if(nextAttempt>maxAttempts) {
        console.error(`Unable to make request after ${maxAttempts} attempts, giving up`);
        throw err;
      }

      console.warn(`Attempt ${nextAttempt} - caught ProvisionedThroughputException`);
      await asyncTimeout(100 + (20**nextAttempt));
      return recursivelyGetIdList(uidList, prevResults, nextAttempt);
    } else {
      throw err;
    }
  }
}
