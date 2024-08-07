import {EventType} from "@guardian/content-api-models/crier/event/v1/eventType";
import {ItemType} from "@guardian/content-api-models/crier/event/v1/itemType";
//import type {KinesisStreamHandler, KinesisStreamRecord} from "aws-lambda";
import type {EventBridgeHandler} from "aws-lambda"
import {registerMetric} from "@recipes-api/cwmetrics";
import {deserializeEvent} from "@recipes-api/lib/capi";
import {retrieveIndexData, writeIndexData} from "@recipes-api/lib/recipes-data";
import {handleDeletedContent, handleTakedown} from "./takedown_processor";
import {handleContentUpdate} from "./update_processor";
import {handleContentUpdateRetrievable} from "./update_retrievable_processor";
import {CrierEvent} from "./eventbridge_models";

const filterProductionMonitoring: boolean = process.env["FILTER_PRODUCTION_MONITORING"] ? process.env["FILTER_PRODUCTION_MONITORING"].toLowerCase() == "yes" : false;

export async function processRecord(r: CrierEvent): Promise<number> {
  if(r.channels && !r.channels.includes("feast")) {
    console.error(`Received a CrierEvent for channels ${r.channels}, which did not include Feast! This is a configuration bug :(`);
    return 0;
  }

  try {
    const evt = deserializeEvent(r.event);

    //we're only interested in content updates
    if (evt.itemType != ItemType.CONTENT) return 0;

    console.log(`DEBUG Received event of type ${evt.eventType} for item of type ${evt.itemType}`);
    switch (evt.eventType) {
      case EventType.DELETE:
        if (filterProductionMonitoring && evt.payloadId.startsWith("production-monitoring")) return 0;
        return handleTakedown(evt);
      case EventType.UPDATE:
      case EventType.RETRIEVABLEUPDATE:
        switch (evt.payload?.kind) {
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
    return 0; //if we get here, no action was taken
  } catch (err) {
    console.error(`ERROR Could not process data from Kinesis: ${(err as Error).toString()}`);
    return 0;
  }
}

export const handler: EventBridgeHandler<string, CrierEvent, void> = async (event) => {
  const updatesTotal = await processRecord(event.detail);

  if (updatesTotal > 0) {
    console.log(`Processed updates for ${updatesTotal} recipes, rebuilding the index json`);
    await registerMetric("UpdatesTotalOfArticle", updatesTotal)
    const indexData = await retrieveIndexData();
    await writeIndexData(indexData);
    console.log("Finished rebuilding index");
  } else {
    console.log("No updates to recipes, so not touching index");
    await registerMetric("UpdatesTotalOfArticle", 0)
  }
}
