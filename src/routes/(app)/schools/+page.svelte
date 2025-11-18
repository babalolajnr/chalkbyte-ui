<script lang="ts">
	import { useSchools, useCreateSchool } from '$lib/queries/school.queries';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import type { SchoolQueryParams } from '$lib/types/school';

	let showForm = $state(false);
	let formData = $state({
		name: '',
		address: ''
	});

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
	const createSchool = useCreateSchool();

	function resetForm() {
		formData = {
			name: '',
			address: ''
		};
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		createSchool.mutate(
			{
				name: formData.name,
				address: formData.address || null
			},
			{
				onSuccess: () => {
					showForm = false;
					resetForm();
				},
				onError: (error: Error) => {
					console.error('Failed to create school:', error.message);
				}
			}
		);
	}

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
				<form onsubmit={handleSubmit} class="space-y-4">
					<div class="space-y-2">
						<Label for="name">Name *</Label>
						<Input id="name" bind:value={formData.name} required placeholder="Enter school name" />
					</div>
					<div class="space-y-2">
						<Label for="address">Address</Label>
						<Input id="address" bind:value={formData.address} placeholder="Enter school address" />
					</div>
					<div class="flex gap-2">
						<Button type="submit" disabled={createSchool.isPending}>
							{#if createSchool.isPending}
								<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
							{/if}
							Create School
						</Button>
						<Button type="button" variant="outline" onclick={() => (showForm = false)}>
							Cancel
						</Button>
					</div>
				</form>
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
