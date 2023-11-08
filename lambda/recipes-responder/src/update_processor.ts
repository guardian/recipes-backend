import type {RetrievableContent} from "@guardian/content-api-models/crier/event/v1/retrievableContent";
import type {Content} from "@guardian/content-api-models/v1/content";

// eslint-disable-next-line @typescript-eslint/require-await -- not implemented yet
export async function handleContentUpdate(content:Content):Promise<void>
{
  throw new Error("handleContentUpdate not implemented yet");
}

// eslint-disable-next-line @typescript-eslint/require-await -- not implemented yet
export async function handleContentUpdateRetrievable(retrievable:RetrievableContent): Promise<void>
{
  throw new Error("handleContentUpdateRetrievable not implemented yet");
}
