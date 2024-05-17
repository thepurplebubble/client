<script lang="ts">
	import { clientStore, fetchClient } from '$lib/client';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { Room } from 'matrix-js-sdk';

	let loading: Promise<void> | null = null;
	let rooms: Room[] = [];

	onMount(async () => {
		loading = fetchClient().catch(() => {
			goto('/login');
		});

		await loading;

		rooms = $clientStore?.getRooms() ?? [];
	});
</script>

<h1>Purple Bubble - {$clientStore?.getUserId() ?? 'Not Logged In'}</h1>
<h2>Rooms</h2>
<ul>
	{#await loading}
		<p>Loading...</p>
	{:then}
		{#each rooms ?? [] as room}
			<li><a href={`/rooms/${room?.roomId}`}>{room?.name}</a></li>
		{/each}
	{:catch error}
		<p>Failed to load rooms: {error.message}</p>
	{/await}
</ul>
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
