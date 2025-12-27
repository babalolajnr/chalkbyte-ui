import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import DataTableCheckbox from './data-table-checkbox.svelte';
import DataTableActions from './data-table-actions.svelte';
import DataTableColumnHeader from './data-table-column-header.svelte';
import PermissionsCell from './permissions-cell.svelte';
import type { CustomRoleWithPermissions } from '$lib/types/roles';

export type ColumnCallbacks = {
	onEdit?: (role: CustomRoleWithPermissions) => void;
	onManagePermissions?: (role: CustomRoleWithPermissions) => void;
};

export function createColumns(callbacks?: ColumnCallbacks): ColumnDef<CustomRoleWithPermissions>[] {
	return [
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
				const nameSnippet = createRawSnippet<[{ name: string; isSystem: boolean }]>((getData) => {
					const { name, isSystem } = getData();
					return {
						render: () =>
							`<div class="flex items-center gap-2">
								<span class="font-medium">${name}</span>
								${isSystem ? '<span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">System</span>' : ''}
							</div>`
					};
				});
				return renderSnippet(nameSnippet, {
					name: row.original.name,
					isSystem: row.original.is_system_role
				});
			},
			enableSorting: true
		},
		{
			accessorKey: 'description',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, { column, title: 'Description' }),
			cell: ({ row }) => {
				const descSnippet = createRawSnippet<[{ description: string | null }]>((getData) => {
					const { description } = getData();
					return {
						render: () =>
							`<div class="max-w-[300px] truncate text-muted-foreground">${description || 'No description'}</div>`
					};
				});
				return renderSnippet(descSnippet, {
					description: row.original.description
				});
			},
			enableSorting: false
		},
		{
			accessorKey: 'permissions',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, { column, title: 'Permissions' }),
			cell: ({ row }) =>
				renderComponent(PermissionsCell, {
					permissions: row.original.permissions || []
				}),
			enableSorting: false
		},
		{
			accessorKey: 'school_id',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Scope' }),
			cell: ({ row }) => {
				const scopeSnippet = createRawSnippet<[{ isSystem: boolean }]>((getData) => {
					const { isSystem } = getData();
					return {
						render: () =>
							`<span class="text-sm ${isSystem ? 'text-primary' : 'text-muted-foreground'}">${isSystem ? 'Global' : 'School'}</span>`
					};
				});
				return renderSnippet(scopeSnippet, {
					isSystem: row.original.is_system_role
				});
			},
			enableSorting: false
		},
		{
			id: 'actions',
			enableHiding: false,
			cell: ({ row }) =>
				renderComponent(DataTableActions, {
					role: row.original,
					onEdit: callbacks?.onEdit,
					onManagePermissions: callbacks?.onManagePermissions
				})
		}
	];
}
