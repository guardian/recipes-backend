export function getBodyContentAsJson(body:unknown): string {
  if(body instanceof Buffer) {
    return body.toString('utf-8')
  } else if(typeof body==='string') {
    JSON.parse(body);
    return body;
  } else if(Array.isArray(body) || typeof body==='object') {
    return JSON.stringify(body);
  } else {
    throw new Error("Did not recognise the body content as json or json-like");
  }
}
