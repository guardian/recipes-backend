import { Storage } from '@google-cloud/storage';
import type { ExternalAccountClientOptions } from 'google-auth-library';
import { ExternalAccountClient } from 'google-auth-library';
import type { ConfigData } from './config';

export function getStorageClient(config: ConfigData) {
	const authClient = ExternalAccountClient.fromJSON(
		config.workloadFederationConfig as ExternalAccountClientOptions,
	);
	if (!authClient) {
		throw new Error('Unable to create google auth client');
	}

	return new Storage({
		projectId: `datatech-platform-${config.stage}`,
		authClient,
	});
}
