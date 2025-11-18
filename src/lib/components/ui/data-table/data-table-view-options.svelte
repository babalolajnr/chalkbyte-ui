<script lang="ts" generics="TData">
	import type { Table, Column } from '@tanstack/table-core';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

	type ViewOptionsProps = {
		table: Table<TData>;
	};

	let { table }: ViewOptionsProps = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="sm" class="h-9">
				View <ChevronDownIcon class="ml-2 size-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		{#each table
			.getAllColumns()
			.filter((col: Column<TData>) => col.getCanHide()) as column (column.id)}
			<DropdownMenu.CheckboxItem
				class="capitalize"
				bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
			>
				{column.id}
			</DropdownMenu.CheckboxItem>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
