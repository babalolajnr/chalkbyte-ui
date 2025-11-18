<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { authStore } from '$lib/stores/auth.store';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();

	onMount(() => {
		authStore.initialize();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<QueryClientProvider client={data.queryClient}>
	{@render children()}
</QueryClientProvider>
