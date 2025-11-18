<script lang="ts">
	import { onMount } from 'svelte';
	import { isAuthenticated, currentUser } from '$lib/stores/auth.store';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import ModeToggle from '$lib/components/mode-toggle.svelte';

	onMount(async () => {
		if ($isAuthenticated) {
			await goto(resolve('/dashboard'));
		}
	});
</script>

<div
	class="flex min-h-svh flex-col items-center justify-center bg-linear-to-b from-gray-50 to-gray-100 px-4 dark:from-gray-900 dark:to-gray-950"
>
	<div class="absolute top-4 right-4">
		<ModeToggle />
	</div>
	<div class="w-full max-w-4xl text-center">
		<h1 class="mb-4 text-5xl font-bold text-gray-900 dark:text-gray-100">Welcome to Chalkbyte</h1>
		<p class="mb-8 text-xl text-gray-600 dark:text-gray-400">
			Your comprehensive learning management system
		</p>

		{#if $isAuthenticated}
			<div class="space-y-4">
				<p class="text-lg text-gray-700 dark:text-gray-300">
					Welcome back, {$currentUser?.first_name}!
				</p>
				<div class="flex justify-center gap-4">
					<Button href="/dashboard" size="lg">Go to Dashboard</Button>
				</div>
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button href="/login" size="lg">Login</Button>
				<Button href="/signup" variant="outline" size="lg">Sign Up</Button>
			</div>
		{/if}
	</div>
</div>
