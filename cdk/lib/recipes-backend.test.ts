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
});
