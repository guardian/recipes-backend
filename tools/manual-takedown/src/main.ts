import * as process from 'process';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { removeAllRecipesForArticle } from '@recipes-api/lib/recipes-data';

const dynamoClient = new DynamoDBClient();

function checkArgs(args: string[]) {
	args.forEach((arg) => {
		if (!process.env[arg]) {
			console.error(`You must specify ${arg} as an environment variable`);
			process.exit(2);
		}
	});
}

async function main() {
	checkArgs(['ARTICLE_ID', 'INDEX_TABLE', 'STATIC_BUCKET', 'CONTENT_URL_BASE']);
	const articleId = process.env['ARTICLE_ID'] as string; //checkArgs ensures that this is valid

	console.log('Attempting takedown on ', articleId);
	await removeAllRecipesForArticle(articleId);
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
