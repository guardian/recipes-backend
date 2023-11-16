/* eslint-disable */
export default {
	displayName: 'lib-recipes-data',
	preset: '../../jest.preset.js',
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
	},
  setupFilesAfterEnv: ["./jest-setup.js"],
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageDirectory: '../../coverage/lib/recipes-data',
};
