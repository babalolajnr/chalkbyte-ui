<script lang="ts" generics="TData, TValue">
	import type {
		ColumnDef,
		ColumnFiltersState,
		RowSelectionState,
		SortingState,
		VisibilityState,
		Updater
	} from '@tanstack/table-core';
	import { getCoreRowModel, getSortedRowModel } from '@tanstack/table-core';
	import {
		createSvelteTable,
		FlexRender,
		DataTablePagination,
		DataTableViewOptions
	} from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import ListFilterIcon from '@lucide/svelte/icons/list-filter';
	import XIcon from '@lucide/svelte/icons/x';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CheckIcon from '@lucide/svelte/icons/check';
	import type { PaginationMeta } from '$lib/types/api';

	type FilterState = {
		first_name: string;
		last_name: string;
		email: string;
		role_id?: string;
		school_id?: string;
	};

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		meta: PaginationMeta;
		onPaginationChange: (offset: number, limit: number) => void;
		onFilterChange: (filters: Partial<FilterState>) => void;
		pageSize?: number;
		initialFilters?: FilterState;
		showFilters?: boolean;
		schools?: { id: string; name: string }[];
		roles?: { id: string; name: string }[];
	};

	let {
		data,
		columns,
		meta,
		onPaginationChange,
		onFilterChange,
		pageSize = $bindable(10),
		initialFilters,
		showFilters = $bindable(false),
		schools = [],
		roles = []
	}: DataTableProps<TData, TValue> = $props();

	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});
	let searchValue = $state('');
	let selectedSchool = $state<string | undefined>(undefined);
	let selectedRole = $state<string | undefined>(undefined);
	let searchTimeout: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		if (initialFilters) {
			searchValue = initialFilters.first_name || initialFilters.email || '';
			selectedSchool = initialFilters.school_id;
			selectedRole = initialFilters.role_id;
		}
	});

	function handleSearchInput(value: string) {
		searchValue = value;
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
		searchTimeout = setTimeout(() => {
			onFilterChange({
				first_name: value || undefined,
				school_id: selectedSchool,
				role_id: selectedRole
			});
		}, 500);
	}

	function handleSchoolFilter(value: string | undefined) {
		selectedSchool = value;
		onFilterChange({
			first_name: searchValue || undefined,
			school_id: value,
			role_id: selectedRole
		});
	}

	function handleRoleFilter(value: string | undefined) {
		selectedRole = value;
		onFilterChange({
			first_name: searchValue || undefined,
			school_id: selectedSchool,
			role_id: value
		});
	}

	function clearFilters() {
		searchValue = '';
		selectedSchool = undefined;
		selectedRole = undefined;
		onFilterChange({});
	}

	const hasActiveFilters = $derived(
		searchValue !== '' || selectedSchool !== undefined || selectedRole !== undefined
	);

	const selectedSchoolName = $derived(
		selectedSchool
			? schools.find((s) => s.id === selectedSchool)?.name || 'Selected'
			: 'All schools'
	);

	const selectedRoleName = $derived(
		selectedRole ? roles.find((r) => r.id === selectedRole)?.name || 'Selected' : 'All roles'
	);

	const table = createSvelteTable({
		get data() {
			return data;
		},
		get columns() {
			return columns;
		},
		state: {
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			},
			get columnFilters() {
				return columnFilters;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		manualPagination: true,
		manualFiltering: true,
		manualSorting: true,
		onSortingChange: (updater: Updater<SortingState>) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater: Updater<VisibilityState>) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onRowSelectionChange: (updater: Updater<RowSelectionState>) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		}
	});
</script>

<div class="w-full">
	<div class="flex flex-col gap-4 py-4">
		<div class="flex items-center justify-between">
			<div class="flex flex-1 items-center gap-2">
				<Input
					placeholder="Search by name..."
					value={searchValue}
					oninput={(e) => handleSearchInput(e.currentTarget.value)}
					class="h-9 w-50 lg:w-75"
				/>
				<Button
					variant="outline"
					size="sm"
					class="h-9"
					onclick={() => (showFilters = !showFilters)}
				>
					<ListFilterIcon class="mr-2 size-4" />
					Filters
					{#if hasActiveFilters}
						<span
							class="ml-2 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground"
						>
							{(searchValue ? 1 : 0) +
								(selectedSchool !== undefined ? 1 : 0) +
								(selectedRole !== undefined ? 1 : 0)}
						</span>
					{/if}
				</Button>
				{#if hasActiveFilters}
					<Button variant="ghost" size="sm" class="h-9 px-2" onclick={clearFilters}>
						Clear
						<XIcon class="ml-2 size-4" />
					</Button>
				{/if}
			</div>
			<DataTableViewOptions {table} />
		</div>
		{#if showFilters}
			<div class="flex flex-wrap items-center gap-4 rounded-md border bg-muted/50 p-3">
				{#if schools.length > 0}
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium">School:</span>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button {...props} variant="outline" size="sm" class="h-8 w-45">
										<span class="truncate">{selectedSchoolName}</span>
										<ChevronDownIcon class="ml-2 h-4 w-4 shrink-0" />
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="start" class="max-h-60 overflow-y-auto">
								<DropdownMenu.Item onclick={() => handleSchoolFilter(undefined)}>
									{#if selectedSchool === undefined}
										<CheckIcon class="mr-2 h-4 w-4" />
									{:else}
										<span class="mr-2 w-4"></span>
									{/if}
									All schools
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								{#each schools as school (school.id)}
									<DropdownMenu.Item onclick={() => handleSchoolFilter(school.id)}>
										{#if selectedSchool === school.id}
											<CheckIcon class="mr-2 h-4 w-4" />
										{:else}
											<span class="mr-2 w-4"></span>
										{/if}
										{school.name}
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				{/if}
				{#if roles.length > 0}
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium">Role:</span>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button {...props} variant="outline" size="sm" class="h-8 w-45">
										<span class="truncate">{selectedRoleName}</span>
										<ChevronDownIcon class="ml-2 h-4 w-4 shrink-0" />
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="start" class="max-h-60 overflow-y-auto">
								<DropdownMenu.Item onclick={() => handleRoleFilter(undefined)}>
									{#if selectedRole === undefined}
										<CheckIcon class="mr-2 h-4 w-4" />
									{:else}
										<span class="mr-2 w-4"></span>
									{/if}
									All roles
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								{#each roles as role (role.id)}
									<DropdownMenu.Item onclick={() => handleRoleFilter(role.id)}>
										{#if selectedRole === role.id}
											<CheckIcon class="mr-2 h-4 w-4" />
										{:else}
											<span class="mr-2 w-4"></span>
										{/if}
										{role.name}
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				{/if}
			</div>
		{/if}
	</div>
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head class="[&:has([role=checkbox])]:pl-3">
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell class="[&:has([role=checkbox])]:pl-3">
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<DataTablePagination
		{meta}
		bind:pageSize
		{onPaginationChange}
		selectedRowCount={table.getFilteredSelectedRowModel().rows.length}
		totalRowCount={data.length}
	/>
</div>
