import { GuStack, type GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import type { App } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import {
	DefinitionBody,
	IntegrationPattern,
	StateMachine,
	Succeed,
} from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';

interface LambdaProps {
	description: string;
	fileName: string;
	initialPolicy?: PolicyStatement[];
	environment?: Record<string, string>;
}

export class ReadMyRecipe extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		//If switching to an inference parameter, use the full ARN in order to make the policy below work
		const modelOrInferenceParam = 'amazon.nova-pro-v1:0';

		const reformatter = this.makeLambdaFunction('Reformatter', {
			description:
				'Ensures that recipe steps and ingredients are written to be suitable for reading out',
			fileName: 'section-reformatter.zip',
			environment: {
				BEDROCK_MODEL: modelOrInferenceParam,
			},
			initialPolicy: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['bedrock:InvokeModel'],
					resources: [
						modelOrInferenceParam.startsWith('arn')
							? modelOrInferenceParam
							: `arn:aws:bedrock:${this.region}::foundation-model/${modelOrInferenceParam}`,
					],
				}),
			],
		});

		const reformatterInvoke = new LambdaInvoke(this, 'ReformatterInvoke', {
			lambdaFunction: reformatter,
			integrationPattern: IntegrationPattern.REQUEST_RESPONSE,
			inputPath: '$',
			resultPath: '$.Reformatted',
			outputPath: '$',
		});

		const success = new Succeed(this, 'success');

		//The state machine works thus:
		// 1. Take recipe body from EventBridge
		// 2. Reformat the text for speaking (via lambda)
		// 3. Take the reformatted text blocks and run them asynchronously through Polly to S3 (via lambda)
		// 4. Check which files are present. (via lambda)
		// 5. Loop if we have not got all the files yet (via Choice)
		new StateMachine(this, 'StateMachine', {
			definitionBody: DefinitionBody.fromChainable(
				reformatterInvoke.next(success),
			),
		});
	}

	makeLambdaFunction(
		id: string,
		{ description, fileName, initialPolicy, environment }: LambdaProps,
	) {
		return new GuLambdaFunction(this, id, {
			app: 'readmyrecipe',
			architecture: Architecture.ARM_64,
			description,
			fileName,
			handler: 'main.handler',
			initialPolicy,
			environment,
			runtime: Runtime.NODEJS_LATEST,
			timeout: Duration.minutes(1),
		});
	}
}
