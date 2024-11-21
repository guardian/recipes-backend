export function mandatoryParameter(name: string): string {
	if (process.env[name]) {
		return process.env[name] as string;
	} else {
		if (process.env['CI']) {
			return 'test';
		} else {
			throw new Error(
				`You need to define the environment variable ${name} in the lambda config`,
			);
		}
	}
}
