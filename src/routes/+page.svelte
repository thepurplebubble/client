<script lang="ts">
	import { clientStore } from '$lib/client-store';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import * as sdk from 'matrix-js-sdk';

	onMount(() => {
		if (!$clientStore) {
			const token = sessionStorage.getItem('token');
			const homeserver = localStorage.getItem('homeserver');
			if (token && homeserver) {
				const client = sdk.createClient({
					baseUrl: homeserver,
					accessToken: token
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
