<script>
	import * as sdk from 'matrix-js-sdk';
	import { goto } from '$app/navigation';

	let client = null;
	let homeserver = '';
	let username = '';
	let password = '';
</script>

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

		console.log('Logged in');

		client.startClient();
	}}>Login</button
>
