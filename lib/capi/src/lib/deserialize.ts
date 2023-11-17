import type {Event} from "@guardian/content-api-models/crier/event/v1/event";
import { EventSerde} from "@guardian/content-api-models/crier/event/v1/event";
import type {ItemResponse} from "@guardian/content-api-models/v1/itemResponse";
import { ItemResponseSerde} from "@guardian/content-api-models/v1/itemResponse";
import type { TProtocol} from "thrift";
import {TCompactProtocol, TFramedTransport} from "thrift";

function feedToThrift(content:string|Buffer):TProtocol {
  const buffer = Buffer.isBuffer(content) ? content : new Buffer(content, 'base64');
  const transport = new TFramedTransport(buffer)
  return new TCompactProtocol(transport);
}

export function deserializeEvent(content:string|Buffer):Event {
  return EventSerde.read(feedToThrift(content));
}

export function deserializeItemResponse(content:string|Buffer):ItemResponse {
  return ItemResponseSerde.read(feedToThrift(content));
}

