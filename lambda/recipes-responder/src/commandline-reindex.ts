import {parseArgs} from "node:util";
import type {RecipeIndex} from "@recipes-api/lib/recipes-data";
import {recipeByUID, retrieveIndexData, writeIndexData} from "@recipes-api/lib/recipes-data";
import {CapiKey} from "./config";
import {INDEX_JSON, V2_INDEX_JSON} from "./constants";
import {handleContentUpdate} from "./update_processor";
import {PollingAction, retrieveContent} from "./update_retrievable_processor";

const oldLog = console.log;
const oldError = console.error;
const oldDebug = console.debug;

global.console.log = (...args: unknown[]) => oldLog("\x1b[34m ", ...args, "\x1b[0m");
global.console.error = (...args: unknown[]) => oldError("\x1b[31m ", ...args, "\x1b[0m");
// Silence the debug logger.  If you want debug logs back, just uncomment `oldDebug` and remove `undefined`.
global.console.debug = (...args: unknown[]) => undefined //oldDebug("\x1b[30m ", ...args, "\x1b[0m")

async function getQueryUri(maybeCapiUri?: string, maybeComposerId?: string, maybeRecipeUid?: string): Promise<string> {
  const capiBase = process.env["STAGE"] == "PROD" ? "https://content.guardianapis.com" : "https://content.code.dev-guardianapis.com";

  if (maybeRecipeUid) {
    const indexEntry = await recipeByUID(maybeRecipeUid);
    if (indexEntry) {
      console.log(`Recipe ${maybeRecipeUid} belongs to CAPI article ${indexEntry.capiArticleId}`);
      return `${capiBase}/${indexEntry.capiArticleId}`
    } else {
      throw new Error(`Could not find a recipe with ID ${maybeRecipeUid}. Are you sure you are querying the right environment?`)
    }
  } else if (maybeCapiUri) {
    if (maybeCapiUri.startsWith("http")) {
      return maybeCapiUri;
    } else {
      return `${capiBase}/${maybeCapiUri}`;
    }
  } else if (maybeComposerId) {
    return `${capiBase}/internal-code/composer/${maybeComposerId}`
  } else {
    throw new Error("You must specify either recipe UID, capi URI or composer ID")
  }
}

async function reindex(queryUri: string): Promise<void> {
  const pollingResult = await retrieveContent(queryUri);
  switch (pollingResult.action) {
    case PollingAction.CONTENT_EXISTS:
      console.log(`Found article with title '${pollingResult.content?.webTitle ?? ""}' published ${pollingResult.content?.webPublicationDate?.iso8601 ?? ""}`);
      if (pollingResult.content) {
        await handleContentUpdate(pollingResult.content);
      } else {
        throw new Error("Got a positive result but no content?? This must be a bug :(");
      }
      break;
    default:
      throw new Error(`Unable to retrieve content from ${queryUri}`)
  }
}

async function indexing(index: RecipeIndex, test?: boolean) {
  console.log(`Re-index all: index was last updated at ${index.lastUpdated.toISOString()}`);
  const articleIdSet = index.recipes.reduce<Set<string>>((idSet, entry) => (
    idSet.add(entry.capiArticleId)
  ), new Set<string>());

  const articleIdList = Array.from(articleIdSet.values());

  console.log(`Re-index all: Found ${index.recipes.length} recipes to re-index across ${articleIdList.length} articles`);
  if (test) {
    console.log("Not performing any operations as --test was specified")
  } else {
    const total = articleIdList.length;
    let i = 1;
    for (const articleId of articleIdList) {
      console.log("------------------------------------------------------");
      console.log(`Article ${i} / ${total}...\n`);
      const queryUri = await getQueryUri(articleId, undefined, undefined);
      await reindex(queryUri);
      console.log("------------------------------------------------------\n");
      i++;
    }
  }
}

async function main() {
//Parse the commandline arguments
  const {
    values: {help, composerId, capiUri, recipeUid, all, test, indexOnly, unSponsoredOnly},
  } = parseArgs({
    options: {
      help: {
        type: "boolean",
        short: "h"
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
      all: {
        type: "boolean",
        short: "a"
      },
      test: {
        type: "boolean",
        short: "t"
      },
      indexOnly: {
        type: "boolean",
        short: "i"
      },
      unSponsoredOnly: {
        type: "boolean",
        short: "uns"
      }
    }
  });

  if (help) {
    console.log("Performs a re-index of the specified recipes in the recipe backend. Requires CAPI dev privileges to run.");
    console.log("This expects the following environment variables to be set. You can get the values by running `./get-local-config.sh` and using `source` on the resulting file:");
    console.log(" - STACK              - deployment stack, required as it's a metrics param");
    console.log(" - LAST_UPDATED_INDEX - name of the Dynamo index for querying `lastUpdated");
    console.log(" - INDEX_TABLE        - Dynamo table that holds the index");
    console.log(" - STATIC_BUCKET      - bucket that holds the static content");
    console.log(" - STAGE              - choose whether to target CODE or PROD");
    console.log(" - CONTENT_URL_BASE   - base URL of the Recipes API");
    console.log(" - FASTLY_API_KEY     - API key to allow flush of the Fastly cache");
    console.log(" - CAPI_KEY           - valid Content API key for internal-tier access to the CAPI environment given by the base URL");

    console.log("You must specify exactly one of  --recipeUid {uid} / --composerId {composerId} / --capiUri {capi-uri} / --all / --index-only to indicate which content to re-index");
    process.exit(0);
  }

  if (!CapiKey || CapiKey == "") {
    console.error("You need to set the CAPI_KEY environment variable to a valid, internal-tier CAPI key for this to work");
    process.exit(1);
  }

  if (process.env["STACK"]) {
    const msg = `Performing re-index operations on ${process.env["STAGE"] ?? ""}`;

    if (process.env["STAGE"] == "PROD") console.error(msg); else console.log(msg);
    console.log("------------------------------------------------------\n");
  }

  if (all && !indexOnly) {
    const indexDataForAllRecipes = await retrieveIndexData();
    await indexing(indexDataForAllRecipes, test)
  } else if (!indexOnly) {
    const queryUri = await getQueryUri(capiUri, composerId, recipeUid);
    if (test) {
      console.log("Not performing any operations as --test was specified")
    } else {
      await reindex(queryUri);
    }
  }

  console.log("------------------------------------------------------");
  console.log("Rebuilding index...");
  const indexDataForAllRecipes = await retrieveIndexData();
  await indexing(indexDataForAllRecipes, test)

  console.log("Finished rebuilding index");
}

main().then(() => {
  console.log("Completed");
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(2);
})
