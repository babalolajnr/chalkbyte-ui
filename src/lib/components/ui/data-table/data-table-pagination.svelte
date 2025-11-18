<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import type { PaginationMeta } from '$lib/types/api';

	type PaginationProps = {
		meta: PaginationMeta;
		pageSize?: number;
		onPaginationChange: (offset: number, limit: number) => void;
		pageSizeOptions?: number[];
		selectedRowCount?: number;
		totalRowCount?: number;
	};

	let {
		meta,
		pageSize = $bindable(10),
		onPaginationChange,
		pageSizeOptions = [10, 20, 30, 50, 100],
		selectedRowCount = 0,
		totalRowCount = 0
	}: PaginationProps = $props();

	const currentPage = $derived(Math.floor(meta.offset / meta.limit) + 1);
	const totalPages = $derived(Math.ceil(meta.total / meta.limit));
	const canPreviousPage = $derived(meta.offset > 0);
	const canNextPage = $derived(meta.has_more);

	const pageNumbers = $derived.by(() => {
		const pages: number[] = [];
		const maxPages = Math.min(totalPages, 100);
		for (let i = 1; i <= maxPages; i++) {
			pages.push(i);
		}
		return pages;
	});

	function handlePreviousPage() {
		if (canPreviousPage) {
			const newOffset = Math.max(0, meta.offset - pageSize);
			onPaginationChange(newOffset, pageSize);
		}
	}

	function handleNextPage() {
		if (canNextPage) {
			const newOffset = meta.offset + pageSize;
			onPaginationChange(newOffset, pageSize);
		}
	}

	function handlePageSelect(page: number) {
		const newOffset = (page - 1) * pageSize;
		onPaginationChange(newOffset, pageSize);
	}

	function handlePageSizeChange(newSize: number) {
		pageSize = newSize;
		onPaginationChange(0, newSize);
	}
</script>

<div class="flex items-center justify-between pt-4">
	<div class="flex items-center gap-4">
		<div class="flex-1 text-sm text-muted-foreground">
			{#if selectedRowCount > 0}
				{selectedRowCount} of {totalRowCount} row(s) selected.
			{:else}
				Showing {meta.offset + 1} to {Math.min(meta.offset + meta.limit, meta.total)} of {meta.total}
				results
			{/if}
		</div>
		<div class="flex items-center gap-2">
			<span class="text-sm whitespace-nowrap text-muted-foreground">Rows per page:</span>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm" class="h-8 w-[70px]">
							{pageSize}
							<ChevronDownIcon class="ml-1 size-4" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					{#each pageSizeOptions as size (size)}
						<DropdownMenu.Item onclick={() => handlePageSizeChange(size)}>
							{size}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
	<div class="flex items-center gap-2">
		<span class="text-sm whitespace-nowrap text-muted-foreground">
			Page {currentPage} of {totalPages}
		</span>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				onclick={handlePreviousPage}
				disabled={!canPreviousPage}
			>
				Previous
			</Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm" class="h-8 w-[70px]">
							{currentPage}
							<ChevronDownIcon class="ml-1 size-4" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="max-h-[300px] overflow-y-auto">
					{#each pageNumbers as page (page)}
						<DropdownMenu.Item onclick={() => handlePageSelect(page)}>
							Page {page}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<Button variant="outline" size="sm" onclick={handleNextPage} disabled={!canNextPage}>
				Next
			</Button>
		</div>
	</div>
</div>
