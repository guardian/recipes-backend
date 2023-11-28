import {InvocationType, InvokeCommand, LambdaClient} from "@aws-sdk/client-lambda";
import {ReindexLambda} from "./config";
import {ExternalException, MisconfiguredException} from "./errors";

const lambdaClient = new LambdaClient({region: process.env["REGION"]});

export async function triggerReindex()
{
  if(!ReindexLambda) {
    console.error("REINDEX_FUNCTION_NAME is not defined, we cannot perform a reindex");
    throw new MisconfiguredException("REINDEX_FUNCTION_NAME is not defined");
  }

  const req = new InvokeCommand({
    FunctionName: ReindexLambda,
    InvocationType: InvocationType.Event,
  });
  const response = await lambdaClient.send(req);
  if(response.FunctionError) {
    console.error(`Unable to launch ${ReindexLambda}: ${response.FunctionError}`);
    throw new ExternalException("Unable to launch reindex process");
  }
}
