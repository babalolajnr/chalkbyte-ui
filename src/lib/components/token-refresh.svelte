<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { setupTokenRefresh } from '$lib/auth-utils';

	let cleanup: (() => void) | null = null;
	const accessToken = localStorage.getItem('access_token');

	onMount(() => {
		if (accessToken) {
			cleanup = setupTokenRefresh();
		}
	});

	onDestroy(() => {
		if (cleanup) {
			cleanup();
		}
	});

	$: {
		if (accessToken && !cleanup) {
			cleanup = setupTokenRefresh();
		} else if (!accessToken && cleanup) {
			cleanup();
			cleanup = null;
		}
	}
</script>
