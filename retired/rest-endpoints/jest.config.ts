/* eslint-disable */
export default {
	displayName: 'lambda-rest-endpoints',
	preset: '../../jest.preset.js',
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
	},
	transformIgnorePatterns: ['node_modules/(?!(lodash-es)/)'],
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageDirectory: '../../coverage/lambda/rest-endpoints',
};
