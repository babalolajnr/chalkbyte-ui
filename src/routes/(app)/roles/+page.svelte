<script lang="ts">
	import { useRoles } from '$lib/queries/roles.queries';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import DataTable from './data-table.svelte';
	import { createColumns } from './columns';
	import type { RoleQueryParams, CustomRoleWithPermissions } from '$lib/types/roles';
	import RoleForm from './role-form.svelte';
	import EditDialog from './edit-dialog.svelte';
	import PermissionDialog from './permission-dialog.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	let showForm = $state(false);
	let showEditDialog = $state(false);
	let showPermissionDialog = $state(false);
	let selectedRole = $state<CustomRoleWithPermissions | null>(null);

	let queryParams = $state<RoleQueryParams>({
		limit: 10,
		offset: 0,
		name: undefined,
		is_system_role: undefined
	});

	let filterState = $state({
		name: ''
	});

	let showFiltersDropdown = $state(false);

	const roles = $derived(useRoles(queryParams));

	function handlePaginationChange(offset: number, limit: number) {
		queryParams = {
			...queryParams,
			offset,
			limit
		};
	}

	function handleFilterChange(filters: { name?: string; is_system_role?: boolean }) {
		filterState = {
			name: filters.name || ''
		};
		queryParams = {
			...queryParams,
			name: filters.name || undefined,
			is_system_role: filters.is_system_role,
			offset: 0
		};
	}

	function handleFormSuccess() {
		showForm = false;
	}

	function handleFormCancel() {
		showForm = false;
	}

	function handleEdit(role: CustomRoleWithPermissions) {
		selectedRole = role;
		showEditDialog = true;
	}

	function handleManagePermissions(role: CustomRoleWithPermissions) {
		selectedRole = role;
		showPermissionDialog = true;
	}

	function handleEditClose() {
		selectedRole = null;
		showEditDialog = false;
	}

	function handlePermissionClose() {
		selectedRole = null;
		showPermissionDialog = false;
	}

	const columns = $derived(
		createColumns({
			onEdit: handleEdit,
			onManagePermissions: handleManagePermissions
		})
	);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
			<p class="text-muted-foreground">Manage roles and their permissions</p>
		</div>
		<Button onclick={() => (showForm = !showForm)}>
			<PlusIcon class="mr-2 h-4 w-4" />
			Add Role
		</Button>
	</div>

	{#if showForm}
		<Card.Root>
			<Card.Header>
				<Card.Title>Create New Role</Card.Title>
				<Card.Description>Add a new role with permissions</Card.Description>
			</Card.Header>
			<Card.Content>
				<RoleForm data={data.form} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
			</Card.Content>
		</Card.Root>
	{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title>All Roles</Card.Title>
			<Card.Description>A list of all roles in the system</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if roles.isLoading}
				<div class="flex items-center justify-center py-8">
					<Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			{:else if roles.isError}
				<div class="py-8 text-center text-destructive">
					<p>Error loading roles</p>
					<p class="text-sm">{roles.error?.message}</p>
				</div>
			{:else if roles.data}
				<DataTable
					data={roles.data.data}
					meta={roles.data.meta}
					{columns}
					onPaginationChange={handlePaginationChange}
					onFilterChange={handleFilterChange}
					pageSize={queryParams.limit}
					initialFilters={filterState}
					bind:showFilters={showFiltersDropdown}
				/>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<EditDialog bind:open={showEditDialog} role={selectedRole} onClose={handleEditClose} />

<PermissionDialog
	bind:open={showPermissionDialog}
	role={selectedRole}
	onClose={handlePermissionClose}
/>
