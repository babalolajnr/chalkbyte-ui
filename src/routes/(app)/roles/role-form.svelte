<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { roleFormSchema, type RoleFormSchema } from './schema';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { ControlAttrs } from 'formsnap';
	import { useCreateRole, usePermissions } from '$lib/queries/roles.queries';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import type { Permission } from '$lib/types/roles';

	let {
		data,
		schoolId,
		onSuccess,
		onCancel
	}: {
		data: SuperValidated<Infer<RoleFormSchema>>;
		schoolId?: string;
		onSuccess?: () => void;
		onCancel?: () => void;
	} = $props();

	const createRole = useCreateRole();
	const permissions = usePermissions({ limit: 100 });

	let selectedPermissions = $state<string[]>([]);

	const groupedPermissions = $derived(() => {
		if (!permissions.data?.data) return {};
		return permissions.data.data.reduce(
			(acc: Record<string, Permission[]>, permission: Permission) => {
				if (!acc[permission.category]) {
					acc[permission.category] = [];
				}
				acc[permission.category].push(permission);
				return acc;
			},
			{} as Record<string, Permission[]>
		);
	});

	function togglePermission(permissionId: string) {
		if (selectedPermissions.includes(permissionId)) {
			selectedPermissions = selectedPermissions.filter((id) => id !== permissionId);
		} else {
			selectedPermissions = [...selectedPermissions, permissionId];
		}
	}

	function toggleCategory(category: string) {
		const categoryPermissions = groupedPermissions()[category] || [];
		const categoryIds = categoryPermissions.map((p) => p.id);
		const allSelected = categoryIds.every((id) => selectedPermissions.includes(id));

		if (allSelected) {
			selectedPermissions = selectedPermissions.filter((id) => !categoryIds.includes(id));
		} else {
			const newIds = categoryIds.filter((id) => !selectedPermissions.includes(id));
			selectedPermissions = [...selectedPermissions, ...newIds];
		}
	}

	function isCategoryChecked(category: string): boolean {
		const categoryPermissions = groupedPermissions()[category] || [];
		const categoryIds = categoryPermissions.map((p) => p.id);
		return categoryIds.length > 0 && categoryIds.every((id) => selectedPermissions.includes(id));
	}

	function isCategoryIndeterminate(category: string): boolean {
		const categoryPermissions = groupedPermissions()[category] || [];
		const categoryIds = categoryPermissions.map((p) => p.id);
		const selectedCount = categoryIds.filter((id) => selectedPermissions.includes(id)).length;
		return selectedCount > 0 && selectedCount < categoryIds.length;
	}

	const form = superForm(data, {
		validators: zod4Client(roleFormSchema),
		onUpdate: ({ form: f }: { form: SuperValidated<Infer<RoleFormSchema>> }) => {
			if (f.valid) {
				createRole.mutate(
					{
						name: f.data.name,
						description: f.data.description || undefined,
						school_id: schoolId || f.data.school_id || undefined,
						permission_ids: selectedPermissions.length > 0 ? selectedPermissions : undefined
					},
					{
						onSuccess: () => {
							selectedPermissions = [];
							onSuccess?.();
						},
						onError: (error: Error) => {
							console.error('Failed to create role:', error.message);
						}
					}
				);
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance class="space-y-6">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props }: { props: ControlAttrs })}
				<Form.Label>Name</Form.Label>
				<Input {...props} bind:value={$formData.name} placeholder="Enter role name" />
			{/snippet}
		</Form.Control>
		<Form.Description>The name of the role (required)</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="description">
		<Form.Control>
			{#snippet children({ props }: { props: ControlAttrs })}
				<Form.Label>Description</Form.Label>
				<Textarea
					{...props}
					bind:value={$formData.description}
					placeholder="Enter role description"
					rows={3}
				/>
			{/snippet}
		</Form.Control>
		<Form.Description>A brief description of the role (optional)</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<div class="space-y-4">
		<div>
			<h4 class="text-sm font-medium">Permissions</h4>
			<p class="text-sm text-muted-foreground">Select the permissions for this role</p>
		</div>

		{#if permissions.isLoading}
			<div class="flex items-center justify-center py-4">
				<Loader2Icon class="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		{:else if permissions.isError}
			<div class="py-4 text-center text-sm text-destructive">Failed to load permissions</div>
		{:else}
			<div class="grid grid-cols-1 gap-4 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each Object.entries(groupedPermissions()) as [category, perms] (category)}
					<div class="space-y-2 rounded-md border p-3">
						<div class="flex items-center gap-2">
							<Checkbox
								checked={isCategoryChecked(category)}
								indeterminate={isCategoryIndeterminate(category)}
								onCheckedChange={() => toggleCategory(category)}
							/>
							<span class="text-sm font-medium capitalize">{category}</span>
						</div>
						<div class="ml-6 space-y-1">
							{#each perms as permission (permission.id)}
								<div class="flex items-center gap-2">
									<Checkbox
										checked={selectedPermissions.includes(permission.id)}
										onCheckedChange={() => togglePermission(permission.id)}
									/>
									<span class="truncate text-sm" title={permission.description || permission.name}
										>{permission.name}</span
									>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<div class="flex gap-2">
		<Form.Button disabled={createRole.isPending}>
			{#if createRole.isPending}
				<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			Create Role
		</Form.Button>
		<Button type="button" variant="outline" onclick={onCancel}>Cancel</Button>
	</div>
</form>
