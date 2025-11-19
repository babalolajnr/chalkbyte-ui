<script lang="ts">
	import { onDestroy } from 'svelte';
	import { setupTokenRefresh } from '$lib/auth-utils';
	import { authStore } from '$lib/stores/auth.store';

	let cleanup: (() => void) | null = null;
	let isAuthenticated = $state(false);

	const unsubscribe = authStore.subscribe((state) => {
		isAuthenticated = state.isAuthenticated;
	});

	$effect(() => {
		if (isAuthenticated && !cleanup) {
			cleanup = setupTokenRefresh();
		} else if (!isAuthenticated && cleanup) {
			cleanup();
			cleanup = null;
		}
	});

	onDestroy(() => {
		if (cleanup) {
			cleanup();
		}
		unsubscribe();
	});
</script>
