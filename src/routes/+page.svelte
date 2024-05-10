<script lang="ts">
	import { clientStore } from '$lib/client-store';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import * as sdk from 'matrix-js-sdk';

	onMount(async () => {
		if (!$clientStore) {
			const accessToken = sessionStorage.getItem('access_token');
			const homeserver = localStorage.getItem('homeserver');
			const userId = sessionStorage.getItem('userId') ?? undefined;
			if (accessToken && homeserver) {
				const client = sdk.createClient({
					baseUrl: homeserver,
					accessToken,
					userId
				});

				client.startClient();

				client.once(sdk.ClientEvent.Sync, () => {
					clientStore.set(client);
				});
			} else {
				goto('/login');
			}
		}
	});
</script>

<h1>Purple Bubble - {$clientStore?.getHomeserverUrl() ?? 'Not Logged In'}</h1>
<p>Account - {$clientStore?.getUserId() ?? 'Not Logged In'}</p>
<button
	on:click={() => {
		$clientStore?.logout().then(() => {
			clientStore.set(null);
			sessionStorage.removeItem('access_token');
			sessionStorage.removeItem('refresh_token');
			sessionStorage.removeItem('userId');
			goto('/login');
		});
	}}>Logout</button
>
{#await $clientStore?.getJoinedRooms()}
	<p>Loading...</p>
{:then rooms}
	{#each rooms?.joined_rooms ?? [] as room}
		{#await $clientStore?.roomInitialSync(room, 2)}
			<p>Loading...</p>
		{:then response}
			{@const name = response?.state?.find((e) => e.type === 'm.room.canonical_alias')?.content[
				'alias'
			]}
			<p>{name}</p>
		{:catch error}
			<p>Failed to load room: {error.message}</p>
		{/await}
	{/each}
{:catch error}
	<p>Failed to load rooms: {error.message}</p>
{/await}
