import type http from 'http';

export function stringToSign(headers: http.IncomingHttpHeaders) {
	if(headers.date && headers['x-content-sha256'] ) {
		return headers.date + '\n' + headers['x-content-sha256'] + '\n';
	} else {
		throw new Error("the incoming request did not have the right content to sign")
	}
}
