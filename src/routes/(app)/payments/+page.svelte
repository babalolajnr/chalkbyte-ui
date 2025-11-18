<script lang="ts">
	import DataTable from "./data-table.svelte";
	import { columns, type Payment } from "./columns.js";

	const data: Payment[] = [
		{
			id: "m5gr84i9",
			amount: 316,
			status: "success",
			email: "ken99@yahoo.com"
		},
		{
			id: "3u1reuv4",
			amount: 242,
			status: "success",
			email: "Abe45@gmail.com"
		},
		{
			id: "derv1ws0",
			amount: 837,
			status: "processing",
			email: "Monserrat44@gmail.com"
		},
		{
			id: "5kma53ae",
			amount: 874,
			status: "success",
			email: "Silas22@gmail.com"
		},
		{
			id: "bhqecj4p",
			amount: 721,
			status: "failed",
			email: "carmella@hotmail.com"
		},
		{
			id: "xk92jdl3",
			amount: 450,
			status: "pending",
			email: "john.doe@example.com"
		},
		{
			id: "pl8mnd21",
			amount: 125,
			status: "processing",
			email: "sarah.wilson@gmail.com"
		},
		{
			id: "qw45tyu8",
			amount: 999,
			status: "success",
			email: "mike.brown@yahoo.com"
		},
		{
			id: "zx78cvb2",
			amount: 550,
			status: "failed",
			email: "emma.davis@hotmail.com"
		},
		{
			id: "as12dfg4",
			amount: 320,
			status: "success",
			email: "oliver.taylor@example.com"
		},
		{
			id: "mn34bnm9",
			amount: 678,
			status: "pending",
			email: "sophia.anderson@gmail.com"
		},
		{
			id: "op56hjk7",
			amount: 890,
			status: "processing",
			email: "lucas.martinez@yahoo.com"
		}
	];
</script>

<div class="container mx-auto py-10">
	<h1 class="mb-4 text-2xl font-bold">Payments</h1>
	<DataTable {data} {columns} />
</div>
