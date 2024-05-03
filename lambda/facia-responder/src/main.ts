import type {SQSHandler, SQSRecord} from "aws-lambda";
import format from "date-fns/format";
import  * as facia  from "@recipes-api/lib/facia";
import {importNewData} from "./submit-data";

function parseMesssage(from:SQSRecord):facia.FeastCuration
{
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- not unsafe because we validate in the next line
  const parsedContent = JSON.parse(from.body);  // will throw if the content is not valid;
  return facia.FeastCuration.parse(parsedContent);
}

async function deployCuration(curation:facia.FeastCuration)
{
  const issueDate = new Date(curation.issueDate);
  for(const frontName of Object.keys(curation.fronts)) {
    console.log(`Deploying new front for ${frontName} in ${curation.edition as string} on ${format(issueDate, "YYYY-mm-dd")}`);
    const serializedFront = JSON.stringify(curation.fronts[frontName]);
    await importNewData(serializedFront, curation.edition, frontName, issueDate);
  }
}

export const handler:SQSHandler = async (event)=> {
  for(const rec of event.Records) {
    console.log(`Received message with ID ${rec.messageId}`);

    //If something fails here, let it crash. The message will get retried and then sent to DLQ
    // by the Lambda runtime and we will continue running
    const newCuration = parseMesssage(rec);
    await deployCuration(newCuration);
  }
}
