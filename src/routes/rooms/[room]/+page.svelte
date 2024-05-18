<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as sdk from 'matrix-js-sdk';
	import { clientStore, fetchClient } from '$lib/client';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	const roomID = $page.params.room;
	let room: sdk.Room | null = null;

	let listener: (event: sdk.MatrixEvent) => void;
	let timeline: sdk.MatrixEvent[] = [];

	let message = '';

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

		listener = (event: sdk.MatrixEvent) => {
			if (event.getRoomId() === roomID) {
				timeline = room?.getLiveTimeline().getEvents() ?? [];
			}
		};

		$clientStore?.on(sdk.RoomEvent.Timeline, listener);

		timeline = room?.getLiveTimeline().getEvents() ?? [];
	});

	onDestroy(() => {
		$clientStore?.removeListener(sdk.RoomEvent.Timeline, listener);
	});
</script>

<svelte:head>
	{#if !room}
		<title>Purple Bubble</title>
	{:else}
		<title>Purple Bubble - {room.name}</title>
	{/if}
</svelte:head>

{#if !room}
	<p>Loading...</p>
{:else}
	<h1>Room - {room.name}</h1>
{/if}

<a href="/">Home</a>

{#each timeline ?? [] as event}
	{#if event.getType() === 'm.room.message'}
		{@const user = $clientStore?.getUser(event.getSender() ?? '')}
		<p><strong>{user?.displayName}:</strong> {event.getContent().body}</p>
	{:else if event.getType() === 'm.room.member'}
		<p><strong>{event.getStateKey()}</strong> {event.getContent().membership}</p>
	{:else}
		<p><i>{event.getType()}</i></p>
	{/if}
{/each}

<input type="text" placeholder="Message" bind:value={message} />
<button
	on:click={() => {
		$clientStore?.sendTextMessage(roomID, message);
		message = '';
	}}>Send</button
>
