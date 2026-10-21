import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { RecipesBackend } from './recipes-backend';

describe('The RecipesBackend stack', () => {
	it('retains the existing Facia queues', () => {
		const app = new App();
		const stack = new RecipesBackend(app, 'RecipesBackend', {
			stack: 'feast',
			stage: 'TEST',
		});
		const queues = Template.fromStack(stack).findResources('AWS::SQS::Queue');

		expect(queues).toHaveProperty('RecipesFaciaDLQA0FC5B46');
		expect(queues).toHaveProperty('RecipesFaciaConnection04952500');
	});

	it('matches the snapshot', () => {
		const app = new App();
		const stack = new RecipesBackend(app, 'RecipesBackend', {
			stack: 'feast',
			stage: 'TEST',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});

	it.each([
		{
			stage: 'CODE',
			policyName: 'feast-unified-api-bqsearchterms-code-s3-write',
			bucketName: 'feast-unified-api-bqsearchterms-code',
		},
		{ stage: 'PROD', policyName: undefined, bucketName: undefined },
		{ stage: 'TEST', policyName: undefined, bucketName: undefined },
	])(
		'manages the stage-specific search-term export policy ($stage)',
		({ stage, policyName, bucketName }) => {
			const app = new App();
			const stack = new RecipesBackend(app, 'RecipesBackend', {
				stack: 'feast',
				stage,
			});
			const template = Template.fromStack(stack);
			const roles = template.findResources('AWS::IAM::Role');
			const xar = roles['DynamicFrontsXARCA695DED'];
			if (!xar) {
				throw new Error('The existing DynamicFronts XAR role is missing');
			}
			const properties = xar.Properties as Record<string, unknown>;
			const policies = properties['Policies'] as Array<Record<string, unknown>>;

			expect(properties['Tags']).toContainEqual({
				Key: 'gu:repo',
				Value: 'guardian/recipes-backend',
			});
			if (policyName) {
				const exportPolicy = {
					PolicyName: policyName,
					PolicyDocument: {
						Version: '2012-10-17',
						Statement: [
							{
								Sid: 'VisualEditor0',
								Effect: 'Allow',
								Action: 's3:PutObject',
								Resource: `arn:aws:s3:::${bucketName}/*`,
							},
						],
					},
				};
				expect(policies).toContainEqual(exportPolicy);
				expect(
					template.findResources('AWS::IAM::Policy', {
						Properties: {
							PolicyName: exportPolicy.PolicyName,
						},
					}),
				).toEqual({});
			} else {
				const statements = policies.flatMap((policy) => {
					const document = policy['PolicyDocument'] as
						| { Statement?: Array<Record<string, unknown>> }
						| undefined;
					return document?.Statement ?? [];
				});
				expect(statements).not.toContainEqual(
					expect.objectContaining({ Action: 's3:PutObject' }),
				);
			}
		},
	);
});
