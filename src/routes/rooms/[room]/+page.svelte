<script lang="ts">
	import { onMount } from 'svelte';
	import * as sdk from 'matrix-js-sdk';
	import { clientStore, fetchClient } from '$lib/client';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	const roomID = $page.params.room;
	let room: sdk.Room | null = null;

	onMount(async () => {
		await fetchClient().catch(() => {
			goto('/login');
		});

		room = $clientStore?.getRoom(roomID) ?? null;

		if (!room) {
			console.log(await $clientStore?.roomInitialSync(roomID, 2));

			room = $clientStore?.getRoom(roomID) ?? null;

			if (!room) {
				throw new Error('Failed to load room');
			}
		}
	});
</script>

{#if !room}
	<p>Loading...</p>
{:else}
	<h1>Room - {room.name}</h1>
{/if}

{#each room?.getLiveTimeline().getEvents() ?? [] as event}
	{#if event.getType() === 'm.room.message'}
		<p><strong>{event.getSender()}:</strong> {event.getContent().body}</p>
	{:else if event.getType() === 'm.room.member'}
		<p><strong>{event.getStateKey()}</strong> {event.getContent().membership}</p>
	{:else}
		<p><i>{event.getType()}</i></p>
	{/if}
{/each}
