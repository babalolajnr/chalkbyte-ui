import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import DataTableCheckbox from './data-table-checkbox.svelte';
import DataTableActions from './data-table-actions.svelte';
import DataTableColumnHeader from './data-table-column-header.svelte';
import type { LevelWithStudentCount } from '$lib/types/level';

export const columns: ColumnDef<LevelWithStudentCount>[] = [
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
			const nameSnippet = createRawSnippet<[{ name: string; id: string }]>((getData) => {
				const { name, id } = getData();
				return {
					render: () =>
						`<a href="/levels/${id}" class="font-medium text-primary hover:underline">${name}</a>`
				};
			});
			return renderSnippet(nameSnippet, {
				name: row.original.name,
				id: row.original.id
			});
		},
		enableSorting: true
	},
	{
		accessorKey: 'description',
		header: ({ column }) =>
			renderComponent(DataTableColumnHeader, { column, title: 'Description' }),
		cell: ({ row }) => {
			const descriptionSnippet = createRawSnippet<[{ description: string | null }]>(
				(getDescription) => {
					const { description } = getDescription();
					return {
						render: () =>
							`<div class="text-muted-foreground max-w-[300px] truncate">${description || 'No description'}</div>`
					};
				}
			);
			return renderSnippet(descriptionSnippet, {
				description: row.original.description
			});
		},
		enableSorting: false
	},
	{
		accessorKey: 'student_count',
		header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Students' }),
		cell: ({ row }) => {
			const countSnippet = createRawSnippet<[{ count: number }]>((getCount) => {
				const { count } = getCount();
				return {
					render: () =>
						`<div class="text-center font-medium">${count}</div>`
				};
			});
			return renderSnippet(countSnippet, {
				count: row.original.student_count
			});
		},
		enableSorting: true
	},
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row }) => renderComponent(DataTableActions, { level: row.original })
	}
];
