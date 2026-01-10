<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		useUserRoles,
		useRoles,
		useAssignRoleToUser,
		useRemoveRoleFromUser
	} from '$lib/queries/roles.queries';
	import type { User } from '$lib/types/user';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import type { CustomRoleWithPermissions } from '$lib/types/roles';

	let {
		open = $bindable(false),
		user,
		onClose
	}: {
		open: boolean;
		user: User | null;
		onClose?: () => void;
	} = $props();

	const roles = useRoles({ limit: 100 });
	const assignRole = useAssignRoleToUser();
	const removeRole = useRemoveRoleFromUser();

	const userRoles = $derived(user ? useUserRoles(user.id) : null);
	const userRoleIds = $derived(userRoles?.data?.map((r: CustomRoleWithPermissions) => r.id) || []);

	let pendingChanges = new SvelteMap<string, 'add' | 'remove'>();
	let isSaving = $state(false);
	let previousOpen = $state(false);

	$effect(() => {
		if (open && !previousOpen) {
			pendingChanges.clear();
		}
		previousOpen = open;
	});

	function isRoleAssigned(roleId: string): boolean {
		const pending = pendingChanges.get(roleId);
		if (pending === 'add') return true;
		if (pending === 'remove') return false;
		return userRoleIds.includes(roleId);
	}

	function toggleRole(roleId: string) {
		const currentlyAssigned = userRoleIds.includes(roleId);
		const pending = pendingChanges.get(roleId);

		if (currentlyAssigned) {
			if (pending === 'remove') {
				pendingChanges.delete(roleId);
			} else {
				pendingChanges.set(roleId, 'remove');
			}
		} else {
			if (pending === 'add') {
				pendingChanges.delete(roleId);
			} else {
				pendingChanges.set(roleId, 'add');
			}
		}
		// SvelteMap is reactive, no need to reassign
	}

	async function handleSave() {
		if (!user || pendingChanges.size === 0) return;

		isSaving = true;
		try {
			const promises: Promise<unknown>[] = [];

			for (const [roleId, action] of pendingChanges) {
				if (action === 'add') {
					promises.push(
						new Promise((resolve, reject) => {
							assignRole.mutate(
								{ userId: user.id, data: { role_id: roleId } },
								{ onSuccess: resolve, onError: reject }
							);
						})
					);
				} else if (action === 'remove') {
					promises.push(
						new Promise((resolve, reject) => {
							removeRole.mutate(
								{ userId: user.id, roleId },
								{ onSuccess: resolve, onError: reject }
							);
						})
					);
				}
			}

			await Promise.all(promises);
			pendingChanges.clear();
			handleClose();
		} catch (error) {
			console.error('Failed to update roles:', error);
		} finally {
			isSaving = false;
		}
	}

	function handleClose() {
		open = false;
		pendingChanges.clear();
		onClose?.();
	}

	const hasChanges = $derived(pendingChanges.size > 0);
</script>

<Dialog.Root bind:open onOpenChange={(v) => !v && handleClose()}>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<ShieldIcon class="h-5 w-5" />
				Manage Roles
			</Dialog.Title>
			<Dialog.Description>
				{#if user}
					Assign or remove roles for <strong>{user.first_name} {user.last_name}</strong>
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<div class="py-4">
			{#if roles.isLoading || userRoles?.isLoading}
				<div class="flex items-center justify-center py-8">
					<Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			{:else if roles.isError || userRoles?.isError}
				<div class="py-8 text-center text-destructive">
					<p>Error loading roles</p>
				</div>
			{:else if roles.data?.data && roles.data.data.length > 0}
				<div class="max-h-[400px] space-y-2 overflow-y-auto">
					{#each roles.data.data as role (role.id)}
						{@const assigned = isRoleAssigned(role.id)}
						{@const pending = pendingChanges.get(role.id)}
						<div
							class="flex items-center gap-3 rounded-md border p-3 transition-colors {pending
								? 'border-primary/50 bg-muted/50'
								: ''}"
						>
							<Checkbox
								checked={assigned}
								onCheckedChange={() => toggleRole(role.id)}
								disabled={isSaving}
							/>
							<div class="flex flex-1 flex-col">
								<div class="flex items-center gap-2">
									<span class="font-medium">{role.name}</span>
									{#if role.is_system_role}
										<span
											class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
										>
											System
										</span>
									{/if}
									{#if pending}
										<span
											class="rounded-full px-2 py-0.5 text-xs font-medium {pending === 'add'
												? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
												: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}"
										>
											{pending === 'add' ? 'Will be added' : 'Will be removed'}
										</span>
									{/if}
								</div>
								{#if role.description}
									<span class="text-sm text-muted-foreground">{role.description}</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="py-8 text-center text-muted-foreground">
					<p>No roles available</p>
				</div>
			{/if}
		</div>

		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={handleClose} disabled={isSaving}>
				Cancel
			</Button>
			<Button onclick={handleSave} disabled={isSaving || !hasChanges}>
				{#if isSaving}
					<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Save Changes
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
