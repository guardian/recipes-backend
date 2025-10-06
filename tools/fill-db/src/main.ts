import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import {
	BatchWriteItemCommand,
	DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { v4 as uuid } from 'uuid';
import {
	type RecipeDatabaseEntry,
	recipeDatabaseEntryToDynamo,
} from '@recipes-api/lib/recipes-data';

const tableName = process.env['TABLE_NAME'];
const client = new DynamoDBClient();
const limit = 30000;

function createRecord(count: number): RecipeDatabaseEntry[] {
	const now = new Date();

	const out: RecipeDatabaseEntry[] = [];
	const fakeHash = Math.random().toString(36).slice(-10);

	for (let i = 0; i < count; i++) {
		out.push({
			capiArticleId: `path/to/fake/recipe/${now.valueOf()}`,

			recipeUID: uuid(),
			lastUpdated: now,
			recipeVersion: fakeHash,
			versions: {
				v2: fakeHash,
				v3: fakeHash,
			},
			sponsorshipCount: 0,
		});
	}

	return out;
}

async function batchWrite(records: Array<Record<string, AttributeValue>>) {
	const RequestItems = {};
	RequestItems[tableName as string] = records.map((Item) => ({
		PutRequest: {
			Item,
		},
	}));

	const req = new BatchWriteItemCommand({
		RequestItems,
	});

	await client.send(req);
}

//START MAIN
if (!tableName || tableName == '') {
	console.log(
		`ERROR You need to set the TABLE_NAME variable to the table to write.  This table will be filled with approximately ${limit} dummy records.`,
	);
	process.exit(1);
}

let recipes = 0;
while (recipes < limit) {
	const countForArticle = Math.ceil(Math.random() * 5);
	const dataToPush = createRecord(countForArticle).map(
		recipeDatabaseEntryToDynamo,
	);

	await batchWrite(dataToPush);
	recipes += countForArticle;
}
