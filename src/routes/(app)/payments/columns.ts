import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table/index.js";
import DataTableCheckbox from "./data-table-checkbox.svelte";
import DataTableEmailButton from "./data-table-email-button.svelte";
import DataTableActions from "./data-table-actions.svelte";

export type Payment = {
	id: string;
	amount: number;
	status: "pending" | "processing" | "success" | "failed";
	email: string;
};

export const columns: ColumnDef<Payment>[] = [
	{
		id: "select",
		header: ({ table }) =>
			renderComponent(DataTableCheckbox, {
				checked: table.getIsAllPageRowsSelected(),
				indeterminate:
					table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
				onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
				"aria-label": "Select all"
			}),
		cell: ({ row }) =>
			renderComponent(DataTableCheckbox, {
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(!!value),
				"aria-label": "Select row"
			}),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const statusSnippet = createRawSnippet<[{ status: string }]>((getStatus) => {
				const { status } = getStatus();
				return {
					render: () => `<div class="capitalize">${status}</div>`
				};
			});
			return renderSnippet(statusSnippet, {
				status: row.original.status
			});
		}
	},
	{
		accessorKey: "email",
		header: ({ column }) =>
			renderComponent(DataTableEmailButton, {
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => {
			const emailSnippet = createRawSnippet<[{ email: string }]>((getEmail) => {
				const { email } = getEmail();
				return {
					render: () => `<div class="lowercase">${email}</div>`
				};
			});
			return renderSnippet(emailSnippet, {
				email: row.original.email
			});
		}
	},
	{
		accessorKey: "amount",
		header: () => {
			const amountHeaderSnippet = createRawSnippet(() => {
				return {
					render: () => `<div class="text-right">Amount</div>`
				};
			});
			return renderSnippet(amountHeaderSnippet);
		},
		cell: ({ row }) => {
			const formatter = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD"
			});
			const amountCellSnippet = createRawSnippet<[{ amount: number }]>((getAmount) => {
				const { amount } = getAmount();
				const formatted = formatter.format(amount);
				return {
					render: () => `<div class="text-right font-medium">${formatted}</div>`
				};
			});
			return renderSnippet(amountCellSnippet, {
				amount: row.original.amount
			});
		}
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => renderComponent(DataTableActions, { id: row.original.id })
	}
];
