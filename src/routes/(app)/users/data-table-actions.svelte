<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import UserIcon from '@lucide/svelte/icons/user';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import { useDeleteUser } from '$lib/queries/user.queries';
	import type { User } from '$lib/types/user';
	import { SystemPermission } from '$lib/types/permissions';
	import { Authorize } from '$lib/components/access-control';

	type ActionsProps = {
		user: User;
		onEdit?: (user: User) => void;
		onViewDetails?: (user: User) => void;
		onManageRoles?: (user: User) => void;
	};

	let { user, onEdit, onViewDetails, onManageRoles }: ActionsProps = $props();

	const deleteUser = useDeleteUser();

	function handleCopyId() {
		navigator.clipboard.writeText(user.id);
	}

	function handleCopyEmail() {
		navigator.clipboard.writeText(user.email);
	}

	function handleEdit() {
		onEdit?.(user);
	}

	function handleViewDetails() {
		onViewDetails?.(user);
	}

	function handleManageRoles() {
		onManageRoles?.(user);
	}

	function handleDelete() {
		if (confirm(`Are you sure you want to delete "${user.first_name} ${user.last_name}"?`)) {
			deleteUser.mutate(user.id);
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
		<Authorize permission={SystemPermission.USERS_READ}>
			<DropdownMenu.Item onclick={handleViewDetails}>
				<UserIcon class="mr-2 h-4 w-4" />
				View Details
			</DropdownMenu.Item>
		</Authorize>
		<Authorize permission={SystemPermission.USERS_UPDATE}>
			<DropdownMenu.Item onclick={handleEdit}>
				<PencilIcon class="mr-2 h-4 w-4" />
				Edit User
			</DropdownMenu.Item>
		</Authorize>
		<Authorize permission={SystemPermission.ROLES_ASSIGN}>
			<DropdownMenu.Item onclick={handleManageRoles}>
				<ShieldIcon class="mr-2 h-4 w-4" />
				Manage Roles
			</DropdownMenu.Item>
		</Authorize>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onclick={handleCopyId}>
			<CopyIcon class="mr-2 h-4 w-4" />
			Copy ID
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={handleCopyEmail}>
			<CopyIcon class="mr-2 h-4 w-4" />
			Copy Email
		</DropdownMenu.Item>
		<Authorize permission={SystemPermission.USERS_DELETE}>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={handleDelete} class="text-destructive">
				<Trash2Icon class="mr-2 h-4 w-4" />
				Delete
			</DropdownMenu.Item>
		</Authorize>
	</DropdownMenu.Content>
</DropdownMenu.Root>
