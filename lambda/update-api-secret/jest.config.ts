/* eslint-disable */
export default {
	displayName: 'lambda-update-api-secret',
	preset: '../../jest.preset.js',
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
	},
	moduleFileExtensions: ['ts', 'js', 'html'],
	transformIgnorePatterns: ['node_modules/(?!(lodash-es)/)'],
	coverageDirectory: '../../coverage/lambda/update-api-secret',
};
