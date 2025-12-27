<script lang="ts">
	import type { Column } from '@tanstack/table-core';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn } from '$lib/utils';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';

	type Props = {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		column: Column<any, any>;
		title: string;
		class?: string;
	};

	let { column, title, class: className }: Props = $props();

	const isSorted = $derived(column.getIsSorted());
</script>

{#if !column.getCanSort()}
	<div class={cn(className)}>
		{title}
	</div>
{:else}
	<div class={cn('flex items-center space-x-2', className)}>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="ghost"
						size="sm"
						class="-ml-3 h-8 data-[state=open]:bg-accent"
					>
						<span>{title}</span>
						{#if isSorted === 'desc'}
							<ArrowDownIcon class="ml-2 size-4" />
						{:else if isSorted === 'asc'}
							<ArrowUpIcon class="ml-2 size-4" />
						{:else}
							<ChevronsUpDownIcon class="ml-2 size-4" />
						{/if}
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start">
				<DropdownMenu.Item onclick={() => column.toggleSorting(false)}>
					<ArrowUpIcon class="mr-2 size-3.5 text-muted-foreground/70" />
					Asc
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={() => column.toggleSorting(true)}>
					<ArrowDownIcon class="mr-2 size-3.5 text-muted-foreground/70" />
					Desc
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={() => column.toggleVisibility(false)}>
					<EyeOffIcon class="mr-2 size-3.5 text-muted-foreground/70" />
					Hide
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{/if}
