/* eslint-disable */
export default {
	displayName: 'printable-recipe-generator',
	preset: '../jest.preset.js',
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
	},
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageDirectory: '../coverage/printable-recipe-generator',
};
