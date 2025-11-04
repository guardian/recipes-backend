import { breakDownUrl } from './url-handling';

describe('breakDownUrl', () => {
	/*it('should extract the parts from a real passed url', () => {
		const result = breakDownUrl(
			'gs://gu-feast-dynamic/2025-03-19/db153/DE-*.json',
		);
		expect(result.gcpBucket).toEqual('gu-feast-dynamic');
		expect(result.prefix).toEqual('2025-03-19/db153/DE-');
	});

	it('should reject an incorrect url', () => {
		expect(() => breakDownUrl('https://path/to/something')).toThrowError(
			new Error('Unable to parse google storage url https://path/to/something'),
		);
	});
	 */
  it('should work for url', () => {
    const result = breakDownUrl('gs://gu-feast-personalised/some-date/some-user-id-*.json');
    expect(result.gcpBucket).toEqual('gu-feast-personalised');
    expect(result.prefix).toEqual('some-date/some-user-id-');
  })
});
