import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Effect, PolicyStatement, User } from 'aws-cdk-lib/aws-iam';
import { Bucket, type IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class StaticServing extends Construct {
	staticBucket: IBucket;

	constructor(scope: GuStack, id: string) {
		super(scope, id);

		const maybePreview = scope.stack.endsWith('-preview') ? '-preview' : '';

		this.staticBucket = new Bucket(this, 'staticServing', {
			bucketName: `recipes-backend${maybePreview}-static-${scope.stage.toLowerCase()}`,
			enforceSSL: true,
			removalPolicy: RemovalPolicy.DESTROY,
		});

		const cdnReadUser = new User(this, 'cdnRead', {
			userName: `recipes-api-cdn${maybePreview}-${scope.stage}`,
		});

		cdnReadUser.addToPolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ['s3:GetObject'],
				resources: [this.staticBucket.bucketArn + '/*'],
			}),
		);
	}
}
