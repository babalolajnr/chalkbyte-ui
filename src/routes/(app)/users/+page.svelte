<script lang="ts">
	import { useUsers } from '$lib/queries/user.queries';
	import { useSchools } from '$lib/queries/school.queries';
	import { useRoles } from '$lib/queries/roles.queries';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import DataTable from './data-table.svelte';
	import { createColumns } from './columns';
	import type { UserQueryParams, User } from '$lib/types/user';
	import UserForm from './user-form.svelte';
	import EditDialog from './edit-dialog.svelte';
	import RolesDialog from './roles-dialog.svelte';
	import DetailsDialog from './details-dialog.svelte';
	import type { PageData } from './$types.js';
	import { authStore } from '$lib/stores/auth.store';
	import { Authorize } from '$lib/components/access-control';
	import { SystemPermission } from '$lib/types/permissions';
	import { isSystemAdmin } from '$lib/auth-utils';

	let { data }: { data: PageData } = $props();

	const user = $derived($authStore.user);

	let showForm = $state(false);
	let showEditDialog = $state(false);
	let showRolesDialog = $state(false);
	let showDetailsDialog = $state(false);
	let selectedUser = $state<User | null>(null);

	let queryParams = $state<UserQueryParams>({
		limit: 10,
		offset: 0,
		first_name: undefined,
		last_name: undefined,
		email: undefined,
		role_id: undefined,
		school_id: undefined
	});

	let filterState = $state({
		first_name: '',
		last_name: '',
		email: '',
		role_id: undefined as string | undefined,
		school_id: undefined as string | undefined
	});

	let showFiltersDropdown = $state(false);

	const users = $derived(useUsers(queryParams));
	const schools = useSchools({ limit: 100 });
	const roles = useRoles({ limit: 100 });

	const canFilterBySchool = $derived(isSystemAdmin());

	const schoolOptions = $derived(
		canFilterBySchool ? schools.data?.data?.map((s) => ({ id: s.id, name: s.name })) || [] : []
	);

	const roleOptions = $derived(roles.data?.data?.map((r) => ({ id: r.id, name: r.name })) || []);

	function handlePaginationChange(offset: number, limit: number) {
		queryParams = {
			...queryParams,
			offset,
			limit
		};
	}

	function handleFilterChange(filters: {
		first_name?: string;
		last_name?: string;
		email?: string;
		role_id?: string;
		school_id?: string;
	}) {
		filterState = {
			first_name: filters.first_name || '',
			last_name: filters.last_name || '',
			email: filters.email || '',
			role_id: filters.role_id,
			school_id: filters.school_id
		};
		queryParams = {
			...queryParams,
			first_name: filters.first_name || undefined,
			last_name: filters.last_name || undefined,
			email: filters.email || undefined,
			role_id: filters.role_id,
			school_id: filters.school_id,
			offset: 0
		};
	}

	function handleFormSuccess() {
		showForm = false;
	}

	function handleFormCancel() {
		showForm = false;
	}

	function handleEdit(user: User) {
		selectedUser = user;
		showEditDialog = true;
	}

	function handleViewDetails(user: User) {
		selectedUser = user;
		showDetailsDialog = true;
	}

	function handleManageRoles(user: User) {
		selectedUser = user;
		showRolesDialog = true;
	}

	function handleEditClose() {
		selectedUser = null;
		showEditDialog = false;
	}

	function handleRolesClose() {
		selectedUser = null;
		showRolesDialog = false;
	}

	function handleDetailsClose() {
		selectedUser = null;
		showDetailsDialog = false;
	}

	function handleDetailsEdit(user: User) {
		showDetailsDialog = false;
		selectedUser = user;
		showEditDialog = true;
	}

	const columns = $derived(
		createColumns({
			onEdit: handleEdit,
			onViewDetails: handleViewDetails,
			onManageRoles: handleManageRoles
		})
	);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="flex items-center gap-2 text-3xl font-bold tracking-tight">User Management</h1>
			<p class="text-muted-foreground">Manage users, assign roles, and configure permissions</p>
		</div>
		<Authorize permission={SystemPermission.USERS_CREATE}>
			<Button onclick={() => (showForm = !showForm)}>
				<PlusIcon class="mr-2 h-4 w-4" />
				Add User
			</Button>
		</Authorize>
	</div>

	<Authorize permission={SystemPermission.USERS_CREATE}>
		{#if showForm}
			<Card.Root>
				<Card.Header>
					<Card.Title>Create New User</Card.Title>
					<Card.Description>Add a new user to the system</Card.Description>
				</Card.Header>
				<Card.Content>
					{#if user}
						<UserForm
							data={data.form}
							schoolId={user.school?.id}
							onSuccess={handleFormSuccess}
							onCancel={handleFormCancel}
						/>
					{/if}
				</Card.Content>
			</Card.Root>
		{/if}
	</Authorize>

	<Authorize permission={SystemPermission.USERS_READ}>
		<Card.Root>
			<Card.Header>
				<Card.Title>All Users</Card.Title>
				<Card.Description>
					A list of all users in the system
					{#if users.data?.meta?.total}
						<span class="ml-1">({users.data.meta.total} total)</span>
					{/if}
				</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if users.isLoading}
					<div class="flex items-center justify-center py-8">
						<Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				{:else if users.isError}
					<div class="py-8 text-center text-destructive">
						<p>Error loading users</p>
						<p class="text-sm">{users.error?.message}</p>
					</div>
				{:else if users.data}
					<DataTable
						data={users.data.data}
						meta={{
							...users.data.meta,
							offset: users.data.meta.offset ?? 0
						}}
						{columns}
						onPaginationChange={handlePaginationChange}
						onFilterChange={handleFilterChange}
						pageSize={queryParams.limit}
						initialFilters={filterState}
						bind:showFilters={showFiltersDropdown}
						schools={schoolOptions}
						roles={roleOptions}
						isSystemAdmin={canFilterBySchool}
					/>
				{/if}
			</Card.Content>
		</Card.Root>
		{#snippet fallback()}
			<Card.Root>
				<Card.Content class="py-8">
					<p class="text-center text-muted-foreground">You don't have permission to view users.</p>
				</Card.Content>
			</Card.Root>
		{/snippet}
	</Authorize>
</div>

<EditDialog bind:open={showEditDialog} user={selectedUser} onClose={handleEditClose} />

<RolesDialog bind:open={showRolesDialog} user={selectedUser} onClose={handleRolesClose} />

<DetailsDialog
	bind:open={showDetailsDialog}
	user={selectedUser}
	onClose={handleDetailsClose}
	onEdit={handleDetailsEdit}
/>
