import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import DataTableCheckbox from './data-table-checkbox.svelte';
import DataTableActions from './data-table-actions.svelte';
import DataTableColumnHeader from './data-table-column-header.svelte';
import type { School } from '$lib/types/school';

export const columns: ColumnDef<School>[] = [
	{
		id: 'select',
		header: ({ table }) =>
			renderComponent(DataTableCheckbox, {
				checked: table.getIsAllPageRowsSelected(),
				indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
				onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
				'aria-label': 'Select all'
			}),
		cell: ({ row }) =>
			renderComponent(DataTableCheckbox, {
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(!!value),
				'aria-label': 'Select row'
			}),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: 'name',
		header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Name' }),
		cell: ({ row }) => {
			const nameSnippet = createRawSnippet<[{ name: string }]>((getName) => {
				const { name } = getName();
				return {
					render: () => `<div class="font-medium">${name}</div>`
				};
			});
			return renderSnippet(nameSnippet, {
				name: row.original.name
			});
		},
		enableSorting: true
	},
	{
		accessorKey: 'address',
		header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Address' }),
		cell: ({ row }) => {
			const addressSnippet = createRawSnippet<[{ address: string | null }]>((getAddress) => {
				const { address } = getAddress();
				return {
					render: () => `<div class="text-muted-foreground">${address || 'No address'}</div>`
				};
			});
			return renderSnippet(addressSnippet, {
				address: row.original.address
			});
		},
		enableSorting: true
	},
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row }) => renderComponent(DataTableActions, { school: row.original })
	}
];
