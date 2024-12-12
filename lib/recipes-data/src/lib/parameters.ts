export function createGetMandatoryParameter<AliasType extends string>(
	name: string,
): () => AliasType {
	return () => {
		if (process.env[name]) {
			return process.env[name] as AliasType;
		} else {
			if (process.env['CI']) {
				return 'test' as AliasType;
			} else {
				throw new Error(
					`You need to define the environment variable ${name} in the lambda config`,
				);
			}
		}
	};
}

export function createGetMandatoryNumberParameter(name: string) {
	const getMandatoryParam = createGetMandatoryParameter(name);
	return () => {
		const param = getMandatoryParam();
		try {
			return parseInt(param);
		} catch (e) {
			throw new Error(
				`Could not parse param ${name} with value ${param} as integer`,
			);
		}
	};
}
