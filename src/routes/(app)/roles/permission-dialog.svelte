<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		usePermissions,
		useAssignPermissionsToRole,
		useRemovePermissionFromRole
	} from '$lib/queries/roles.queries';
	import type { CustomRoleWithPermissions, Permission } from '$lib/types/roles';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import ShieldIcon from '@lucide/svelte/icons/shield';

	let {
		open = $bindable(false),
		role,
		onClose
	}: {
		open: boolean;
		role: CustomRoleWithPermissions | null;
		onClose?: () => void;
	} = $props();

	const permissions = usePermissions({ limit: 100 });
	const assignPermissions = useAssignPermissionsToRole();
	const removePermission = useRemovePermissionFromRole();

	let selectedPermissions = $state<string[]>([]);
	let initialPermissions = $state<string[]>([]);

	$effect(() => {
		if (role && open) {
			const permIds = role.permissions?.map((p) => p.id) || [];
			selectedPermissions = [...permIds];
			initialPermissions = [...permIds];
		}
	});

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

	const hasChanges = $derived(() => {
		if (selectedPermissions.length !== initialPermissions.length) return true;
		return !selectedPermissions.every((id) => initialPermissions.includes(id));
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

	async function handleSave() {
		if (!role) return;

		const toAdd = selectedPermissions.filter((id) => !initialPermissions.includes(id));
		const toRemove = initialPermissions.filter((id) => !selectedPermissions.includes(id));

		try {
			// Add new permissions
			if (toAdd.length > 0) {
				await assignPermissions.mutateAsync({
					roleId: role.id,
					data: { permission_ids: toAdd }
				});
			}

			// Remove permissions one by one
			for (const permId of toRemove) {
				await removePermission.mutateAsync({
					roleId: role.id,
					permissionId: permId
				});
			}

			handleClose();
		} catch (error) {
			console.error('Failed to update permissions:', error);
		}
	}

	function handleClose() {
		open = false;
		selectedPermissions = [];
		initialPermissions = [];
		onClose?.();
	}

	const isSaving = $derived(assignPermissions.isPending || removePermission.isPending);
</script>

<Dialog.Root bind:open onOpenChange={(v) => !v && handleClose()}>
	<Dialog.Content class="max-h-[85vh] max-w-2xl overflow-hidden">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<ShieldIcon class="h-5 w-5" />
				Manage Permissions
			</Dialog.Title>
			<Dialog.Description>
				{#if role}
					Configure permissions for <strong>{role.name}</strong>
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<div class="max-h-[50vh] overflow-y-auto py-4">
			{#if permissions.isLoading}
				<div class="flex items-center justify-center py-8">
					<Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			{:else if permissions.isError}
				<div class="py-8 text-center text-destructive">
					<p>Failed to load permissions</p>
					<p class="text-sm">{permissions.error?.message}</p>
				</div>
			{:else}
				<div class="space-y-6">
					{#each Object.entries(groupedPermissions()) as [category, perms] (category)}
						<div class="space-y-3">
							<div class="flex items-center gap-2 border-b pb-2">
								<Checkbox
									checked={isCategoryChecked(category)}
									indeterminate={isCategoryIndeterminate(category)}
									onCheckedChange={() => toggleCategory(category)}
								/>
								<span class="text-sm font-semibold capitalize">{category}</span>
								<span class="text-xs text-muted-foreground">
									({perms.filter((p) => selectedPermissions.includes(p.id)).length}/{perms.length})
								</span>
							</div>
							<div class="ml-6 grid gap-3 sm:grid-cols-2">
								{#each perms as permission (permission.id)}
									<div
										class="flex items-start gap-2 rounded-md border p-2 transition-colors hover:bg-muted/50"
									>
										<Checkbox
											checked={selectedPermissions.includes(permission.id)}
											onCheckedChange={() => togglePermission(permission.id)}
											class="mt-0.5"
										/>
										<div class="grid gap-0.5">
											<span class="text-sm font-medium">{permission.name}</span>
											{#if permission.description}
												<span class="text-xs text-muted-foreground">
													{permission.description}
												</span>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<Dialog.Footer>
			<div class="flex w-full items-center justify-between">
				<span class="text-sm text-muted-foreground">
					{selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
				</span>
				<div class="flex gap-2">
					<Button variant="outline" onclick={handleClose} disabled={isSaving}>Cancel</Button>
					<Button onclick={handleSave} disabled={!hasChanges() || isSaving}>
						{#if isSaving}
							<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Save Changes
					</Button>
				</div>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
