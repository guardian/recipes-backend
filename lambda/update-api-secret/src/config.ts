import * as process from 'process';

export const Stage = mandatoryParam('STAGE');

function mandatoryParam(paramName: string): string {
	if (process.env[paramName]) {
		return process.env[paramName] as string;
	} else {
		throw new Error(`You must specify ${paramName} in the environment`);
	}
}
