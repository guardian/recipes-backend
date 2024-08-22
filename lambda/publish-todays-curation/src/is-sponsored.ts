import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { Stack, Stage } from './config';

interface RecipeItem {
	sponsorshipCount?: { N: string };
}

export async function isSponsored(recipeUID: string): Promise<boolean> {
	const maybePreview = Stack.endsWith('-preview') ? '-preview' : '';
	const tableName = `recipes-backend${maybePreview}-indexstore-${Stage}`;
	try {
		const client = new DynamoDBClient({ region: process.env.AWS_REGION });
		const req = new QueryCommand({
			TableName: tableName,
			IndexName: 'idxRecipeUID',
			KeyConditionExpression: 'recipeUID = :uid',
			ExpressionAttributeValues: {
				':uid': { S: recipeUID },
			},
		});

		const response = await client.send(req);
		if (response.Items && response.Items.length > 0) {
			const item = response.Items[0] as RecipeItem;
			return (
				!!item.sponsorshipCount?.N && parseInt(item.sponsorshipCount.N) > 0
			);
		} else {
			console.log(
				`ERROR [${recipeUID}] - valid recipe not found in ${tableName}`,
			);
			return false;
		}
	} catch (error) {
		console.log(
			`ERROR [${recipeUID}] - error retrieving recipe from ${tableName}`,
			error,
		);
		return false;
	}
}
