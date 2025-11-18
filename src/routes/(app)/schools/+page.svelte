<script lang="ts">
	import { useSchools } from '$lib/queries/school.queries';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import type { SchoolQueryParams } from '$lib/types/school';
	import SchoolForm from './school-form.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	let showForm = $state(false);

	let queryParams = $state<SchoolQueryParams>({
		limit: 10,
		offset: 0,
		name: undefined,
		address: undefined
	});

	let filterState = $state({
		name: '',
		address: ''
	});

	let showFiltersDropdown = $state(false);

	const schools = $derived(useSchools(queryParams));

	function handlePaginationChange(offset: number, limit: number) {
		queryParams = {
			...queryParams,
			offset,
			limit
		};
	}

	function handleFilterChange(filters: { name?: string; address?: string }) {
		filterState = {
			name: filters.name || '',
			address: filters.address || ''
		};
		queryParams = {
			...queryParams,
			name: filters.name || undefined,
			address: filters.address || undefined,
			offset: 0
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
			<h1 class="text-3xl font-bold tracking-tight">Schools</h1>
			<p class="text-muted-foreground">Manage your schools</p>
		</div>
		<Button onclick={() => (showForm = !showForm)}>
			<PlusIcon class="mr-2 h-4 w-4" />
			Add School
		</Button>
	</div>

	{#if showForm}
		<Card.Root>
			<Card.Header>
				<Card.Title>Create New School</Card.Title>
				<Card.Description>Add a new school to the system</Card.Description>
			</Card.Header>
			<Card.Content>
				<SchoolForm data={data.form!} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
			</Card.Content>
		</Card.Root>
	{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title>All Schools</Card.Title>
			<Card.Description>A list of all schools in the system</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if schools.isLoading}
				<div class="flex items-center justify-center py-8">
					<Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			{:else if schools.isError}
				<div class="py-8 text-center text-destructive">
					<p>Error loading schools</p>
					<p class="text-sm">{schools.error?.message}</p>
				</div>
			{:else if schools.data}
				<DataTable
					data={schools.data.data}
					meta={schools.data.meta}
					{columns}
					onPaginationChange={handlePaginationChange}
					onFilterChange={handleFilterChange}
					pageSize={queryParams.limit}
					initialFilters={filterState}
					bind:showFilters={showFiltersDropdown}
				/>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
