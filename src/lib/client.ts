import { writable } from 'svelte/store';
import * as sdk from 'matrix-js-sdk';
import type { MatrixClient } from 'matrix-js-sdk';

let client: MatrixClient | null = null;

export const clientStore = writable<MatrixClient | null>(null);

clientStore.subscribe((value) => {
	client = value;
});

export function fetchClient() {
	if (!client) {
		const accessToken = sessionStorage.getItem('access_token');
		const homeserver = localStorage.getItem('homeserver');
		const userId = sessionStorage.getItem('userId') ?? undefined;
		if (accessToken && homeserver) {
			const newClient = sdk.createClient({
				baseUrl: homeserver,
				accessToken,
				userId
			});

			newClient.startClient();

			return new Promise<void>((resolve) => {
				newClient.once(sdk.ClientEvent.Sync, () => {
					clientStore.set(newClient);
					resolve();
				});
			});
		} else {
			return Promise.reject('No access token or homeserver URL found');
		}
	}

	return Promise.resolve();
}
