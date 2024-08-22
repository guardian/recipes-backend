import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { isSponsored } from './is-sponsored';

jest.mock('./config', () => ({
	Stack: 'TEST-STACK',
	Stage: 'TEST-STAGE',
}));

const dynamoClientMock = mockClient(DynamoDBClient);

describe('isSponsored', () => {
	const consoleLogSpy = jest
		.spyOn(console, 'log')
		.mockImplementation(jest.fn());

	afterAll(() => {
		consoleLogSpy.mockRestore();
	});

	it('should return the value of sponsorshipCount when the field exists for the recipe', async () => {
		dynamoClientMock.on(QueryCommand).resolves({
			Items: [{ recipeUID: { S: 'id-1' }, sponsorshipCount: { N: '1' } }],
		});
		const result = await isSponsored('id-1');
		expect(result).toBe(true);
	});

	it('should return false where the sponsorshipCount field does not exist for the recipe', async () => {
		dynamoClientMock.on(QueryCommand).resolves({
			Items: [{ recipeUID: { S: 'id-1' } }],
		});
		const result = await isSponsored('id-1');
		expect(result).toBe(false);
	});

	it('should return false when the recipe cannot be found', async () => {
		dynamoClientMock.on(QueryCommand).resolves({
			Items: [],
		});
		const result = await isSponsored('id-1');
		expect(result).toBe(false);
		expect(consoleLogSpy).toHaveBeenCalledWith(
			'ERROR [id-1] - valid recipe not found in recipes-backend-indexstore-TEST-STAGE',
		);
	});

	it('should return false when an error occurs during the query', async () => {
		dynamoClientMock.on(QueryCommand).rejects(new Error('Query failed'));
		const result = await isSponsored('id-1');
		expect(result).toBe(false);
		expect(consoleLogSpy).toHaveBeenCalledWith(
			'ERROR [id-1] - error retrieving recipe from recipes-backend-indexstore-TEST-STAGE',
			new Error('Query failed'),
		);
	});
});
