import type {DeletedContent} from "@guardian/content-api-models/crier/event/v1/deletedContent";
import type {Event} from "@guardian/content-api-models/crier/event/v1/event"

// eslint-disable-next-line @typescript-eslint/require-await -- not implemented yet
export async function handleTakedown(evt:Event):Promise<void> {
  throw new Error("handleTakedown is not implemented yet")
}

// eslint-disable-next-line @typescript-eslint/require-await -- not implemented yet
export async function handleDeletedContent(evt:DeletedContent):Promise<void> {
  throw new Error("handleTakedown is not implemented yet")
}
