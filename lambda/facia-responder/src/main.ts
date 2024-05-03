import {SQSHandler} from "aws-lambda";
import  * as test  from "@recipes-api/lib/facia";

export const handler:SQSHandler = async (event)=> {
  for(const rec of event.Records) {
    console.log(`Received message with ID ${rec.messageId}`);

  }
}
