import * as process from 'process';
import {
	getFastlyApiKey,
	getStaticBucketName,
	removeAllRecipesForArticle,
} from '@recipes-api/lib/recipes-data';

function checkArgs(args: string[]) {
	args.forEach((arg) => {
		if (!process.env[arg]) {
			console.error(`You must specify ${arg} as an environment variable`);
			process.exit(2);
		}
	});
}

async function main() {
	checkArgs(['ARTICLE_ID', 'INDEX_TABLE']);
	const articleId = process.env['ARTICLE_ID'] as string; //checkArgs ensures that this is valid
	const staticBucketName = getStaticBucketName();
	const fastlyApiKey = getFastlyApiKey();

	console.log('Attempting takedown on ', articleId);
	await removeAllRecipesForArticle(articleId, staticBucketName, fastlyApiKey);
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
