import {parseArgs} from "node:util";
import {CapiKey} from "./config";
import {handleContentUpdate} from "./update_processor";
import {PollingAction, retrieveContent} from "./update_retrievable_processor";
import {recipeByUID} from "@recipes-api/lib/recipes-data";

const oldLog = console.log;
const oldError = console.error;
const oldDebug = console.debug;

global.console.log = (...args: unknown[])=>oldLog("\x1b[34m ", ...args, "\x1b[0m")
global.console.error = (...args: unknown[]) => oldError("\x1b[31m ", ...args, "\x1b[0m")
global.console.debug = (...args: unknown[]) => undefined //oldDebug("\x1b[30m ", ...args, "\x1b[0m")

async function getQueryUri(maybeCapiUri?:string, maybeComposerId?:string, maybeRecipeUid?: string):Promise<string> {
  const capiBase = process.env["STAGE"]=="PROD" ? "https://content.guardianapis.com" : "https://content.code.dev-guardianapis.com";

  if(maybeRecipeUid) {
    const indexEntry = await recipeByUID(maybeRecipeUid);
    if(indexEntry) {
      console.log(`Recipe ${maybeRecipeUid} belongs to CAPI article ${indexEntry.capiArticleId}`);
      return `${capiBase}/${indexEntry.capiArticleId}`
    } else {
      throw new Error(`Could not find a recipe with ID ${maybeRecipeUid}. Are you sure you are querying the right environment?`)
    }
  } else if(maybeCapiUri) {
    return maybeCapiUri
  } else if(maybeComposerId) {
    return `${capiBase}/internal-code/composer/${maybeComposerId}`
  } else {
    throw new Error("You must specify either recipe UID, capi URI or composer ID")
  }
}

async function main() {
//Parse the commandline arguments
  const {
    values: {help, composerId, capiUri, recipeUid, recipeVersion},
  } = parseArgs({
    options: {
      help: {
        type: "boolean",
        short: "h"
      },
      recipeVersion: {
        type: "string"
      },
      recipeUid: {
        type: "string"
      },
      composerId: {
        type: "string",
      },
      capiUri: {
        type: "string",
      },
      test: {
        type: "boolean",
        short: "t"
      }
    }
  });

  if (help) {
    console.log("Performs a re-index of the specified recipes in the recipe backend. Requires CAPI dev privileges to run.");
    console.log("This expects the following environment variables to be set:");
    console.log(" - CONTENT_URL_BASE  - base URL of the Guardian content API (e.g. https://content.guardianapis.com)");
    console.log(" - CAPI_KEY          - valid Content API key for internal-tier access to the CAPI environment given by the base URL");
    console.log("You must specify exactly one of --recipeVersion {checksumId} / --recipeUid {uid} / --composerId {composerId} / --capiId {capiId} ");
    process.exit(0);
  }

  if (!CapiKey || CapiKey == "") {
    console.error("You need to set the CAPI_KEY environment variable to a valid, internal-tier CAPI key for this to work");
    process.exit(1);
  }

  const queryUri = await getQueryUri(capiUri, composerId, recipeUid)
  const pollingResult = await retrieveContent(queryUri);
  switch(pollingResult.action) {
    case PollingAction.CONTENT_EXISTS:
      console.log(`Found article with title '${pollingResult.content?.webTitle ?? ""}' published ${pollingResult.content?.webPublicationDate?.iso8601 ?? ""}`);
      if(pollingResult.content) {
        await handleContentUpdate(pollingResult.content);
      } else {
        throw new Error("Got a positive result but no content?? This must be a bug :(");
      }
      break;
    default:
      throw new Error(`Unable to retrieve content from ${queryUri}`)
  }
}

main().then(()=>{
  console.log("Completed");
  process.exit(0);
}).catch((err)=>{
  console.error(err);
  process.exit(2);
})
