import type { Request } from 'express';

export function countryCodeFromCDN(req: Request): string | undefined {
	//The CDN configuration should give us these headers:
	/*
  set req.http.client-geo-city = client.geo.city;
  set req.http.client-geo-continent = client.geo.continent_code;
  set req.http.client-geo-country = client.geo.country_code;
  set req.http.client-geo-region = client.geo.region;
   */
	const maybeHeaders = req.headers['client-geo-country'];
	console.log('INFO CDN gave country(s) as ', maybeHeaders);

	if (Array.isArray(maybeHeaders)) {
		return maybeHeaders[0];
	} else {
		return maybeHeaders;
	}
}

export function regionFromCDN(req: Request): string | undefined {
	const maybeHeaders = req.headers['client-geo-region'];
	console.log('INFO CDN gave region(s) as ', maybeHeaders);

	if (Array.isArray(maybeHeaders)) {
		return maybeHeaders[0];
	} else {
		return maybeHeaders;
	}
}
