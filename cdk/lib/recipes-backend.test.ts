import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { RecipesBackend } from './recipes-backend';

describe('The RecipesBackend stack', () => {
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
			policyName: 'feast-unifiedapi-datatransfer-code-s3-write',
			bucketName: 'feast-unifiedapi-datatransfer-code',
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
			const invokeFetcher = {
				PolicyName: 'invokeFetcher',
				PolicyDocument: {
					Version: '2012-10-17',
					Statement: [
						{
							Effect: 'Allow',
							Action: 'lambda:InvokeFunction',
							Resource: {
								'Fn::GetAtt': ['DynamicFrontsFetcher3EADD89B', 'Arn'],
							},
						},
					],
				},
			};
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

			expect(xar).toBeDefined();
			expect(properties['Policies']).toEqual(
				policyName ? [invokeFetcher, exportPolicy] : [invokeFetcher],
			);
			expect(properties['RoleName']).toBeUndefined();
			expect(properties['Tags']).toContainEqual({
				Key: 'gu:repo',
				Value: 'guardian/recipes-backend',
			});
			if (policyName) {
				expect(
					template.findResources('AWS::IAM::Policy', {
						Properties: {
							PolicyName: exportPolicy.PolicyName,
						},
					}),
				).toEqual({});
				expect(xar).toMatchSnapshot(`${stage} DynamicFronts XAR`);
			}
		},
	);
});
