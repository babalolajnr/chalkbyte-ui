import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import DataTableCheckbox from './data-table-checkbox.svelte';
import DataTableActions from './data-table-actions.svelte';
import DataTableColumnHeader from './data-table-column-header.svelte';
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
			enableHiding: false
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
							`<div class="flex items-center gap-3">
								<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
									${initials}
								</div>
								<div class="flex flex-col">
									<span class="font-medium">${firstName} ${lastName}</span>
									<span class="text-xs text-muted-foreground">${email}</span>
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
			enableSorting: true
		},
		{
			accessorKey: 'email',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Email' }),
			cell: ({ row }) => {
				const emailSnippet = createRawSnippet<[{ email: string }]>((getData) => {
					const { email } = getData();
					return {
						render: () => `<div class="max-w-[200px] truncate">${email}</div>`
					};
				});
				return renderSnippet(emailSnippet, {
					email: row.original.email
				});
			},
			enableSorting: true,
			enableHiding: true
		},
		{
			accessorKey: 'school',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'School' }),
			cell: ({ row }) => {
				const schoolSnippet = createRawSnippet<[{ schoolName: string | null }]>((getData) => {
					const { schoolName } = getData();
					return {
						render: () =>
							`<span class="text-sm ${schoolName ? '' : 'text-muted-foreground'}">${schoolName ?? 'No school'}</span>`
					};
				});
				return renderSnippet(schoolSnippet, {
					schoolName: row.original.school?.name ?? null
				});
			},
			enableSorting: false
		},
		{
			accessorKey: 'roles',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Roles' }),
			cell: ({ row }) => {
				const rolesSnippet = createRawSnippet<[{ roles: string }]>((getData) => {
					const { roles } = getData();
					return {
						render: () => `<span class="text-sm">${roles}</span>`
					};
				});
				return renderSnippet(rolesSnippet, {
					roles: row.original.roles.map((r) => r.name).join(', ') || 'No roles'
				});
			},
			enableSorting: false
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
						render: () => `<span class="text-sm text-muted-foreground">${formatted}</span>`
					};
				});
				return renderSnippet(dateSnippet, {
					date: row.original.created_at
				});
			},
			enableSorting: true
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
				})
		}
	];
}
