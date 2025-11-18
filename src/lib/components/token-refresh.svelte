<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { setupTokenRefresh } from '$lib/auth-utils';
	import { isAuthenticated } from '$lib/stores/auth.store';

	let cleanup: (() => void) | null = null;

	onMount(() => {
		if ($isAuthenticated) {
			cleanup = setupTokenRefresh();
		}
	});

	onDestroy(() => {
		if (cleanup) {
			cleanup();
		}
	});

	$: {
		if ($isAuthenticated && !cleanup) {
			cleanup = setupTokenRefresh();
		} else if (!$isAuthenticated && cleanup) {
			cleanup();
			cleanup = null;
		}
	}
</script>
