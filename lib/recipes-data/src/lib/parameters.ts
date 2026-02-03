export function createGetMandatoryParameter(name: string): () => string {
	return (): string => {
		if (process.env[name]) {
			return process.env[name] as string;
		}
		if (process.env['CI']) {
			return 'test';
		}
		throw new Error(
			`You need to define the environment variable ${name} in the lambda config`,
		);
	};
}

export function createGetMandatoryNumberParameter(name: string) {
	const getMandatoryParam = createGetMandatoryParameter(name);
	return () => {
		const param = getMandatoryParam();
		try {
			return parseInt(param);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars -- we need a parameter here
		} catch (e) {
			throw new Error(
				`Could not parse param ${name} with value ${param} as integer`,
			);
		}
	};
}
