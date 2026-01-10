import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import DataTableCheckbox from './data-table-checkbox.svelte';
import DataTableActions from './data-table-actions.svelte';
import DataTableColumnHeader from './data-table-column-header.svelte';
import { TruncatedCell } from '$lib/components/ui/data-table/index.js';
import type { User } from '$lib/types/user';

export type ColumnCallbacks = {
	onEdit?: (user: User) => void;
	onViewDetails?: (user: User) => void;
	onManageRoles?: (user: User) => void;
};

export function createColumns(callbacks?: ColumnCallbacks): ColumnDef<User>[] {
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
			enableHiding: false,
			size: 40
		},
		{
			accessorKey: 'name',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Name' }),
			cell: ({ row }) => {
				const nameSnippet = createRawSnippet<
					[{ firstName: string; lastName: string; email: string }]
				>((getData) => {
					const { firstName, lastName, email } = getData();
					const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
					return {
						render: () =>
							`<div class="flex items-center gap-3 min-w-0">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
									${initials}
								</div>
								<div class="flex flex-col min-w-0">
									<span class="font-medium truncate">${firstName} ${lastName}</span>
									<span class="text-xs text-muted-foreground truncate">${email}</span>
								</div>
							</div>`
					};
				});
				return renderSnippet(nameSnippet, {
					firstName: row.original.first_name,
					lastName: row.original.last_name,
					email: row.original.email
				});
			},
			enableSorting: true,
			size: 200
		},
		{
			accessorKey: 'email',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Email' }),
			cell: ({ row }) =>
				renderComponent(TruncatedCell, {
					value: row.original.email,
					maxWidth: '180px'
				}),
			enableSorting: true,
			enableHiding: true,
			size: 200
		},
		{
			accessorKey: 'school',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'School' }),
			cell: ({ row }) => {
				const schoolName = row.original.school?.name;
				if (!schoolName) {
					const emptySnippet = createRawSnippet(() => ({
						render: () => `<span class="text-sm text-muted-foreground">No school</span>`
					}));
					return renderSnippet(emptySnippet, {});
				}
				return renderComponent(TruncatedCell, {
					value: schoolName,
					maxWidth: '150px'
				});
			},
			enableSorting: false,
			size: 170
		},
		{
			accessorKey: 'roles',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Roles' }),
			cell: ({ row }) => {
				const roles = row.original.roles.map((r) => r.name).join(', ') || 'No roles';
				if (row.original.roles.length === 0) {
					const emptySnippet = createRawSnippet(() => ({
						render: () => `<span class="text-sm text-muted-foreground">No roles</span>`
					}));
					return renderSnippet(emptySnippet, {});
				}
				return renderComponent(TruncatedCell, {
					value: roles,
					maxWidth: '120px'
				});
			},
			enableSorting: false,
			size: 140
		},
		{
			accessorKey: 'created_at',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Created' }),
			cell: ({ row }) => {
				const dateSnippet = createRawSnippet<[{ date: string }]>((getData) => {
					const { date } = getData();
					const formatted = new Date(date).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					});
					return {
						render: () =>
							`<span class="text-sm text-muted-foreground whitespace-nowrap">${formatted}</span>`
					};
				});
				return renderSnippet(dateSnippet, {
					date: row.original.created_at
				});
			},
			enableSorting: true,
			size: 120
		},
		{
			id: 'actions',
			enableHiding: false,
			cell: ({ row }) =>
				renderComponent(DataTableActions, {
					user: row.original,
					onEdit: callbacks?.onEdit,
					onViewDetails: callbacks?.onViewDetails,
					onManageRoles: callbacks?.onManageRoles
				}),
			size: 50
		}
	];
}
