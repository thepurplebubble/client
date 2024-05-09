<script lang="ts">
	import { clientStore } from '$lib/client-store';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!$clientStore) {
			goto('/login');
		}
	});
</script>

<h1>Purple Bubble - {$clientStore?.getHomeserverUrl() ?? 'Not Logged In'}</h1>
{#await $clientStore?.getJoinedRooms()}
	<p>Loading...</p>
{:then rooms}
	{#each rooms?.joined_rooms ?? [] as room}
		<p>{room}</p>
	{/each}
{:catch error}
	<p>Failed to load rooms: {error.message}</p>
{/await}
