import {EventType} from "@guardian/content-api-models/crier/event/v1/eventType";
import {ItemType} from "@guardian/content-api-models/crier/event/v1/itemType";
import type {KinesisStreamHandler, KinesisStreamRecord} from "aws-lambda";
import {deserializeEvent} from "./deserialize";
import {handleDeletedContent, handleTakedown} from "./takedown_processor";
import {handleContentUpdate, handleContentUpdateRetrievable} from "./update_processor";

const filterProductionMonitoring:boolean = process.env["FILTER_PRODUCTION_MONITORING"] ? process.env["FILTER_PRODUCTION_MONITORING"].toLowerCase() =="yes" : false;

export async function processRecord(r:KinesisStreamRecord) {
  try {
    const evt = deserializeEvent(r.kinesis.data);

    //we're only interested in content updates
    if(evt.itemType!=ItemType.CONTENT) return null;

    console.log(`DEBUG Received event of type ${evt.eventType} for item of type ${evt.itemType}`);
    switch(evt.eventType) {
      case EventType.DELETE:
        if(filterProductionMonitoring && evt.payloadId.startsWith("production-monitoring")) return null;
        return handleTakedown(evt);
      case EventType.UPDATE:
      case EventType.RETRIEVABLEUPDATE:
        switch(evt.payload?.kind) {
          case undefined:
            console.log("DEBUG Event had no payload");
            break;
          case "content":
            return handleContentUpdate(evt.payload.content);
          case "retrievableContent":
            return handleContentUpdateRetrievable(evt.payload.retrievableContent);
          case "deletedContent":
            return handleDeletedContent(evt.payload.deletedContent);
          default:
            break;
        }
        break;
      default:
        console.error("ERROR Unknown event type ", evt.eventType);
    }
  } catch (err) {
    console.error(`ERROR Could not process data from Kinesis: ${(err as Error).toString()}`);
    return null;
  }
}

export const handler:KinesisStreamHandler = async (event) => {
  await Promise.all(event.Records.map((r)=>processRecord(r)))
}