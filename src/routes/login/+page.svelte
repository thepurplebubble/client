<script>
	import * as sdk from 'matrix-js-sdk';
	import { goto } from '$app/navigation';

	import { clientStore, fetchClient } from '$lib/client';
	import { onMount } from 'svelte';

	let client = null;
	let homeserver = '';
	let username = '';
	let password = '';

	onMount(() => {
		fetchClient()
			.then(() => {
				goto('/');
			})
			.catch(() => {
				homeserver = localStorage.getItem('homeserver') ?? '';
				username = localStorage.getItem('username') ?? '';
			});
	});
</script>

<svelte:head>
	<title>Purple Bubble - Login</title>
</svelte:head>

<h1>Purple Bubble - Login</h1>
<label>
	Homeserver
	<input id="homeserver-input" type="text" bind:value={homeserver} />
</label>
<br />
<label>
	Username
	<input id="username-input" type="text" bind:value={username} />
</label>
<br />
<label>
	Password
	<input id="password-input" type="password" bind:value={password} />
</label>
<br />

<button
	on:click={async () => {
		client = sdk.createClient({
			baseUrl: homeserver
		});

		await client.login('m.login.password', { user: username, password });

		if (client.isLoggedIn()) {
			console.log('Logged in');
		} else {
			console.log('Failed to log in');
			return;
		}

		localStorage.setItem('homeserver', homeserver);
		localStorage.setItem('username', username);
		sessionStorage.setItem('access_token', client.getAccessToken() ?? '');
		sessionStorage.setItem('refresh_token', client.getRefreshToken() ?? '');
		sessionStorage.setItem('userId', client.getUserId() ?? '');

		client.startClient();

		clientStore.set(client);

		goto('/');
	}}>Login</button
>
