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

export function validateDateParam(dateParam:string):Date|null {
  const checker = /^(\d{4})-(\d{2})-(\d{2})$/;
  const parts = checker.exec(dateParam);

  if(!parts) {
    console.warn(`Provided date argument ${dateParam} is not valid `);
    throw new Error("Provided date was not valid");
  } else {
    const year = parseInt(parts[1]);
    if(year<2024) throw new Error("Invalid year");
    const month = parseInt(parts[2]);
    if(month<1 || month>12) throw new Error("Invalid number of months");
    const day = parseInt(parts[3]);
    if(day<1 || day>31) throw new Error("Invalid number of days");

    return new Date(year,month-1,day);
  }
}
