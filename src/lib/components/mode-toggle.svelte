<script lang="ts">
	import { Moon, Sun, Monitor } from '@lucide/svelte';
	import { setMode, mode } from 'mode-watcher';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	let currentMode = $derived(mode.current);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="icon">
				<Sun
					class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
				/>
				<Moon
					class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item onclick={() => setMode('light')}>
			<Sun class="mr-2 h-4 w-4" />
			<span>Light</span>
			{#if currentMode === 'light'}
				<span class="ml-auto">✓</span>
			{/if}
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => setMode('dark')}>
			<Moon class="mr-2 h-4 w-4" />
			<span>Dark</span>
			{#if currentMode === 'dark'}
				<span class="ml-auto">✓</span>
			{/if}
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => setMode('system')}>
			<Monitor class="mr-2 h-4 w-4" />
			<span>System</span>
			{#if currentMode !== 'light' && currentMode !== 'dark'}
				<span class="ml-auto">✓</span>
			{/if}
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
