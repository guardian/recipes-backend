import serverlessExpress from '@codegenie/serverless-express';
import type { Logger } from '@codegenie/serverless-express/src/logger';
import { app } from './app';

const consoleLogger: Logger = {
	debug: console.debug,
	error: console.error,
	info: console.info,
	verbose: console.debug,
	warn: console.warn,
};

export const handler = serverlessExpress({ app, log: consoleLogger });
