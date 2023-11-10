import type {Event} from "@guardian/content-api-models/crier/event/v1/event";
import { EventSerde} from "@guardian/content-api-models/crier/event/v1/event";
import type { TProtocol} from "thrift";
import {TCompactProtocol, TFramedTransport} from "thrift";

function deserializeEvent(content:string|Buffer):Event {
  const buffer = Buffer.isBuffer(content) ? content : new Buffer(content, 'base64');
  const transport = new TFramedTransport(buffer)
  const protocol: TProtocol = new TCompactProtocol(transport);
  return EventSerde.read(protocol);
}

export {deserializeEvent};
