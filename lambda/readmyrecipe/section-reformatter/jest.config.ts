/* eslint-disable */
export default {
	displayName: 'lambda/readmyrecipe/section-reformatter',
	preset: '../../../jest.preset.js',
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
	},
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageDirectory:
		'../../../coverage/lambda/readmyrecipe/section-reformatter',
};
