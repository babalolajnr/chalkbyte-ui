<!-- eslint-disable @typescript-eslint/no-unsafe-call -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import { useDeleteSchool } from '$lib/queries/school.queries';
	import type { School } from '$lib/types/school';
	import { Schools } from '$lib/authorization';
	import { resolve } from '$app/paths';

	type ActionsProps = {
		school: School;
	};

	let { school }: ActionsProps = $props();

	const deleteSchool = useDeleteSchool();

	const canDelete = $derived(Schools.canDelete());

	function handleCopyId() {
		navigator.clipboard.writeText(school.id);
	}

	function handleDelete() {
		if (confirm(`Are you sure you want to delete "${school.name}"?`)) {
			deleteSchool.mutate(school.id);
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" class="h-8 w-8 p-0">
				<span class="sr-only">Open menu</span>
				<MoreHorizontalIcon class="h-4 w-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Label>Actions</DropdownMenu.Label>
		<DropdownMenu.Item>
			<a
				href={resolve(`/schools/${school.id}`)}
				class="flex items-center"
				data-sveltekit-preload-data
			>
				<EyeIcon class="mr-2 h-4 w-4" />
				View Details
			</a>
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={handleCopyId}>
			<CopyIcon class="mr-2 h-4 w-4" />
			Copy ID
		</DropdownMenu.Item>
		{#if canDelete}
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={handleDelete} class="text-destructive">
				<Trash2Icon class="mr-2 h-4 w-4" />
				Delete
			</DropdownMenu.Item>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
