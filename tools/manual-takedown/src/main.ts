import * as process from 'process';
import {
	getContentPrefix,
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
	const contentPrefix = getContentPrefix();

	console.log('Attempting takedown on ', articleId);
	await removeAllRecipesForArticle({
		canonicalArticleId: articleId,
		staticBucketName,
		fastlyApiKey,
		contentPrefix,
	});
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
