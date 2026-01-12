<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import { useDeleteRole } from '$lib/queries/roles.queries';
	import type { CustomRoleWithPermissions } from '$lib/types/roles';
	import { Authorize } from '$lib/components/access-control';
	import { SystemPermission } from '$lib/types/permissions';

	type ActionsProps = {
		role: CustomRoleWithPermissions;
		onEdit?: (role: CustomRoleWithPermissions) => void;
		onManagePermissions?: (role: CustomRoleWithPermissions) => void;
	};

	let { role, onEdit, onManagePermissions }: ActionsProps = $props();

	const deleteRole = useDeleteRole();

	function handleCopyId() {
		navigator.clipboard.writeText(role.id);
	}

	function handleEdit() {
		onEdit?.(role);
	}

	function handleManagePermissions() {
		onManagePermissions?.(role);
	}

	function handleDelete() {
		if (confirm(`Are you sure you want to delete "${role.name}"?`)) {
			deleteRole.mutate(role.id);
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" class="h-8 w-8 p-0">
				<span class="sr-only">Open menu</span>
				<MoreHorizontalIcon class="h-4 w-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Label>Actions</DropdownMenu.Label>
		<Authorize permission={SystemPermission.ROLES_UPDATE}>
			<DropdownMenu.Item onclick={handleEdit}>
				<PencilIcon class="mr-2 h-4 w-4" />
				Edit Role
			</DropdownMenu.Item>
		</Authorize>
		<Authorize permission={SystemPermission.ROLES_MANAGE}>
			<DropdownMenu.Item onclick={handleManagePermissions}>
				<ShieldIcon class="mr-2 h-4 w-4" />
				Manage Permissions
			</DropdownMenu.Item>
		</Authorize>
		<DropdownMenu.Item onclick={handleCopyId}>
			<CopyIcon class="mr-2 h-4 w-4" />
			Copy ID
		</DropdownMenu.Item>
		<Authorize permission={SystemPermission.ROLES_DELETE}>
			<DropdownMenu.Separator />
			<DropdownMenu.Item
				onclick={handleDelete}
				class="text-destructive"
				disabled={role.is_system_role}
			>
				<Trash2Icon class="mr-2 h-4 w-4" />
				Delete
			</DropdownMenu.Item>
		</Authorize>
	</DropdownMenu.Content>
</DropdownMenu.Root>
