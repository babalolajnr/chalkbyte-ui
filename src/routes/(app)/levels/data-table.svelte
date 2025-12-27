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
		DataTableViewOptions
	} from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import XIcon from '@lucide/svelte/icons/x';
	import type { LevelPaginationMeta } from '$lib/types/level';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		meta: LevelPaginationMeta;
		onPaginationChange: (page: number, perPage: number) => void;
		onFilterChange: (filters: { name?: string }) => void;
		onSortingChange?: (field: string, order: 'asc' | 'desc') => void;
		pageSize?: number;
		initialFilters?: { name: string };
	};

	let {
		data,
		columns,
		meta,
		onPaginationChange,
		onFilterChange,
		onSortingChange,
		pageSize = $bindable(10),
		initialFilters
	}: DataTableProps<TData, TValue> = $props();

	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});
	let filterValue = $state(initialFilters?.name || '');
	let nameFilterTimeout: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		if (initialFilters) {
			filterValue = initialFilters.name;
		}
	});

	function handleFilterInput(value: string) {
		filterValue = value;
		if (nameFilterTimeout) {
			clearTimeout(nameFilterTimeout);
		}
		nameFilterTimeout = setTimeout(() => {
			onFilterChange({ name: value || undefined });
		}, 500);
	}

	function clearFilters() {
		filterValue = '';
		onFilterChange({ name: undefined });
	}

	const hasActiveFilters = $derived(filterValue !== '');

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
				{#if hasActiveFilters}
					<Button variant="ghost" size="sm" class="h-9 px-2" onclick={clearFilters}>
						Clear
						<XIcon class="ml-2 size-4" />
					</Button>
				{/if}
			</div>
			<DataTableViewOptions {table} />
		</div>
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
	<div class="flex items-center justify-between py-4">
		<div class="text-sm text-muted-foreground">
			{table.getFilteredSelectedRowModel().rows.length} of {data.length} row(s) selected.
		</div>
		<div class="flex items-center gap-2">
			<span class="text-sm text-muted-foreground">
				Page {meta.current_page} of {meta.total_pages}
			</span>
			<Button
				variant="outline"
				size="sm"
				onclick={() => onPaginationChange(meta.current_page - 1, pageSize)}
				disabled={meta.current_page <= 1}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => onPaginationChange(meta.current_page + 1, pageSize)}
				disabled={meta.current_page >= meta.total_pages}
			>
				Next
			</Button>
		</div>
	</div>
</div>
