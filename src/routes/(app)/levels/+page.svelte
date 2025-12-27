<script lang="ts">
	import { useLevels } from '$lib/queries/level.queries';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import type { LevelQueryParams } from '$lib/types/level';
	import LevelForm from './level-form.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	let showForm = $state(false);

	let queryParams = $state<LevelQueryParams>({
		per_page: 10,
		page: 1,
		name: undefined
	});

	let filterState = $state({
		name: ''
	});

	const levels = $derived(useLevels(queryParams));

	function handlePaginationChange(page: number, perPage: number) {
		queryParams = {
			...queryParams,
			page,
			per_page: perPage
		};
	}

	function handleFilterChange(filters: { name?: string }) {
		filterState = {
			name: filters.name || ''
		};
		queryParams = {
			...queryParams,
			name: filters.name || undefined,
			page: 1
		};
	}

	function handleFormSuccess() {
		showForm = false;
	}

	function handleFormCancel() {
		showForm = false;
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Levels</h1>
			<p class="text-muted-foreground">Manage student levels and grades</p>
		</div>
		<Button onclick={() => (showForm = !showForm)}>
			<PlusIcon class="mr-2 h-4 w-4" />
			Add Level
		</Button>
	</div>

	{#if showForm}
		<Card.Root>
			<Card.Header>
				<Card.Title>Create New Level</Card.Title>
				<Card.Description>Add a new level to organize students</Card.Description>
			</Card.Header>
			<Card.Content>
				<LevelForm data={data.form!} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
			</Card.Content>
		</Card.Root>
	{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title>All Levels</Card.Title>
			<Card.Description>A list of all levels in your school</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if levels.isLoading}
				<div class="flex items-center justify-center py-8">
					<Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			{:else if levels.isError}
				<div class="py-8 text-center text-destructive">
					<p>Error loading levels</p>
					<p class="text-sm">{levels.error?.message}</p>
				</div>
			{:else if levels.data}
				<DataTable
					data={levels.data.data}
					meta={levels.data.meta}
					{columns}
					onPaginationChange={handlePaginationChange}
					onFilterChange={handleFilterChange}
					pageSize={queryParams.per_page}
					initialFilters={filterState}
				/>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
