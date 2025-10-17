import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import {
	AttributeType,
	BillingMode,
	type ITable,
	ProjectionType,
	Table,
	TableEncryption,
} from 'aws-cdk-lib/aws-dynamodb';
import { Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

export class DataStore extends Construct {
	table: ITable;
	lastUpdatedIndexName: string;
	recipeUIDIndexName: string;

	constructor(scope: GuStack, id: string) {
		super(scope, id);

		const maybePreview = scope.stack.endsWith('-preview') ? '-preview' : '';

		const table = new Table(this, 'RecipeTable', {
			tableName: `recipes-backend${maybePreview}-indexstore-${scope.stage}`,
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: {
				name: 'capiArticleId',
				type: AttributeType.STRING,
			},
			sortKey: {
				name: 'recipeUID',
				type: AttributeType.STRING,
			},
			pointInTimeRecoverySpecification: {
				pointInTimeRecoveryEnabled: true,
			},
			encryption: TableEncryption.AWS_MANAGED,
		});

		Tags.of(table).add('devx-backup-enabled', 'true');

		this.lastUpdatedIndexName = 'idxArticleLastUpdated';

		table.addGlobalSecondaryIndex({
			partitionKey: {
				name: 'capiArticleId',
				type: AttributeType.STRING,
			},
			sortKey: {
				name: 'lastUpdated',
				type: AttributeType.STRING,
			},
			projectionType: ProjectionType.ALL,
			indexName: this.lastUpdatedIndexName,
		});

		this.recipeUIDIndexName = 'idxRecipeUID';

		table.addGlobalSecondaryIndex({
			partitionKey: {
				name: 'recipeUID',
				type: AttributeType.STRING,
			},
			projectionType: ProjectionType.INCLUDE,
			indexName: this.recipeUIDIndexName,
			nonKeyAttributes: ['recipeVersion'],
		});
		this.table = table;
	}
}
