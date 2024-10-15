import format from 'date-fns/format';
import { generatePublicationMessage } from './util';

describe('generatePublicationMessage', () => {
	it('should generate a different message if the issueDate is today', () => {
		const nowTime = new Date();
		const formattedDateToday = format(nowTime, 'yyyy-MM-dd');
		const result = generatePublicationMessage(formattedDateToday);
		expect(result).toEqual(
			'This issue has been published and should be live in the app imminently',
		);
	});

	it('should include the issue date if the issueDate is not today', () => {
		const result = generatePublicationMessage(
			'2023-02-10',
			new Date(2023, 1, 1),
		);
		expect(result).toContain('Fri, 10th Feb 2023');
	});

	it('should warn if the issue date is in the past', () => {
		const result = generatePublicationMessage(
			'2023-02-10',
			new Date(2024, 1, 1),
		);
		expect(result).toContain(
			'This issue has been published but its date is in the past so it can only be seen in the Fronts Preview tool',
		);
	});
});
