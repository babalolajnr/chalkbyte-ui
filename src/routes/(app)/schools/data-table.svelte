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
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import ListFilterIcon from '@lucide/svelte/icons/list-filter';
	import XIcon from '@lucide/svelte/icons/x';
	import type { PaginationMeta } from '$lib/types/api';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		meta: PaginationMeta;
		onPaginationChange: (offset: number, limit: number) => void;
		onFilterChange: (filters: { name?: string; address?: string }) => void;
		onSortingChange?: (field: string, order: 'asc' | 'desc') => void;
		pageSize?: number;
		initialFilters?: { name: string; address: string };
		showFilters?: boolean;
	};

	let {
		data,
		columns,
		meta,
		onPaginationChange,
		onFilterChange,
		onSortingChange,
		pageSize = $bindable(10),
		initialFilters,
		showFilters = $bindable(false)
	}: DataTableProps<TData, TValue> = $props();

	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});
	let filterValue = $state(initialFilters?.name || '');
	let addressFilter = $state(initialFilters?.address || '');
	let nameFilterTimeout: ReturnType<typeof setTimeout> | undefined;
	let addressFilterTimeout: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		if (initialFilters) {
			filterValue = initialFilters.name;
			addressFilter = initialFilters.address;
		}
	});

	function handleFilterInput(value: string) {
		filterValue = value;
		if (nameFilterTimeout) {
			clearTimeout(nameFilterTimeout);
		}
		nameFilterTimeout = setTimeout(() => {
			onFilterChange({ name: value, address: addressFilter });
		}, 500);
	}

	function handleAddressFilterInput(value: string) {
		addressFilter = value;
		if (addressFilterTimeout) {
			clearTimeout(addressFilterTimeout);
		}
		addressFilterTimeout = setTimeout(() => {
			onFilterChange({ name: filterValue, address: value });
		}, 500);
	}

	function clearFilters() {
		filterValue = '';
		addressFilter = '';
		onFilterChange({ name: undefined, address: undefined });
	}

	const hasActiveFilters = $derived(filterValue !== '' || addressFilter !== '');

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
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
			if (onSortingChange && sorting.length > 0) {
				const sort = sorting[0];
				onSortingChange(sort.id, sort.desc ? 'desc' : 'asc');
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
					placeholder="Filter by name..."
					value={filterValue}
					oninput={(e) => handleFilterInput(e.currentTarget.value)}
					class="h-9 w-[200px] lg:w-[300px]"
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
							{(filterValue ? 1 : 0) + (addressFilter ? 1 : 0)}
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
			<div class="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
				<div class="flex flex-1 items-center gap-2">
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium">Address:</span>
						<Input
							placeholder="Filter address..."
							value={addressFilter}
							oninput={(e) => handleAddressFilterInput(e.currentTarget.value)}
							class="h-8 w-[200px]"
						/>
					</div>
				</div>
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
