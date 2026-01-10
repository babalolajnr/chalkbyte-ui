<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { useUserRoles } from '$lib/queries/roles.queries';
	import type { User } from '$lib/types/user';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import UserIcon from '@lucide/svelte/icons/user';
	import MailIcon from '@lucide/svelte/icons/mail';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import SchoolIcon from '@lucide/svelte/icons/school';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import LayersIcon from '@lucide/svelte/icons/layers';
	import GitBranchIcon from '@lucide/svelte/icons/git-branch';

	let {
		open = $bindable(false),
		user,
		onClose,
		onEdit
	}: {
		open: boolean;
		user: User | null;
		onClose?: () => void;
		onEdit?: (user: User) => void;
	} = $props();

	const userRoles = $derived(user ? useUserRoles(user.id) : null);

	function handleClose() {
		open = false;
		onClose?.();
	}

	function handleEdit() {
		if (user) {
			onEdit?.(user);
			handleClose();
		}
	}

	function formatDate(dateString: string | null): string {
		if (!dateString) return 'Not set';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatDateTime(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getInitials(firstName: string, lastName: string): string {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	}
</script>

<Dialog.Root bind:open onOpenChange={(v) => !v && handleClose()}>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<UserIcon class="h-5 w-5" />
				User Details
			</Dialog.Title>
		</Dialog.Header>

		{#if user}
			<div class="space-y-6 py-4">
				<!-- User Avatar and Name -->
				<div class="flex items-center gap-4">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary"
					>
						{getInitials(user.first_name, user.last_name)}
					</div>
					<div>
						<h3 class="text-lg font-semibold">{user.first_name} {user.last_name}</h3>
						<p class="text-sm text-muted-foreground">{user.email}</p>
					</div>
				</div>

				<Separator />

				<!-- User Information -->
				<div class="grid gap-4">
					<div class="flex items-start gap-3">
						<MailIcon class="mt-0.5 h-4 w-4 text-muted-foreground" />
						<div>
							<p class="text-sm font-medium">Email</p>
							<p class="text-sm text-muted-foreground">{user.email}</p>
						</div>
					</div>

					<div class="flex items-start gap-3">
						<SchoolIcon class="mt-0.5 h-4 w-4 text-muted-foreground" />
						<div>
							<p class="text-sm font-medium">School</p>
							<p class="text-sm text-muted-foreground">
								{user.school?.name ?? 'No school assigned'}
							</p>
						</div>
					</div>

					<div class="flex items-start gap-3">
						<LayersIcon class="mt-0.5 h-4 w-4 text-muted-foreground" />
						<div>
							<p class="text-sm font-medium">Level</p>
							<p class="text-sm text-muted-foreground">
								{user.level?.name ?? 'Not assigned'}
							</p>
						</div>
					</div>

					<div class="flex items-start gap-3">
						<GitBranchIcon class="mt-0.5 h-4 w-4 text-muted-foreground" />
						<div>
							<p class="text-sm font-medium">Branch</p>
							<p class="text-sm text-muted-foreground">
								{user.branch?.name ?? 'Not assigned'}
							</p>
						</div>
					</div>

					{#if user.grade_level}
						<div class="flex items-start gap-3">
							<SchoolIcon class="mt-0.5 h-4 w-4 text-muted-foreground" />
							<div>
								<p class="text-sm font-medium">Grade Level</p>
								<p class="text-sm text-muted-foreground">{user.grade_level}</p>
							</div>
						</div>
					{/if}

					<div class="flex items-start gap-3">
						<CalendarIcon class="mt-0.5 h-4 w-4 text-muted-foreground" />
						<div>
							<p class="text-sm font-medium">Date of Birth</p>
							<p class="text-sm text-muted-foreground">{formatDate(user.date_of_birth)}</p>
						</div>
					</div>

					<div class="flex items-start gap-3">
						<CalendarIcon class="mt-0.5 h-4 w-4 text-muted-foreground" />
						<div>
							<p class="text-sm font-medium">Account Created</p>
							<p class="text-sm text-muted-foreground">{formatDateTime(user.created_at)}</p>
						</div>
					</div>

					<div class="flex items-start gap-3">
						<CalendarIcon class="mt-0.5 h-4 w-4 text-muted-foreground" />
						<div>
							<p class="text-sm font-medium">Last Updated</p>
							<p class="text-sm text-muted-foreground">{formatDateTime(user.updated_at)}</p>
						</div>
					</div>
				</div>

				<Separator />

				<!-- User Roles -->
				<div class="space-y-3">
					<div class="flex items-center gap-2">
						<ShieldIcon class="h-4 w-4 text-muted-foreground" />
						<p class="text-sm font-medium">Assigned Roles</p>
					</div>

					{#if userRoles?.isLoading}
						<div class="flex items-center py-2">
							<Loader2Icon class="h-4 w-4 animate-spin text-muted-foreground" />
							<span class="ml-2 text-sm text-muted-foreground">Loading roles...</span>
						</div>
					{:else if userRoles?.isError}
						<p class="text-sm text-destructive">Failed to load roles</p>
					{:else if userRoles?.data && userRoles.data.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each userRoles.data as role (role.id)}
								<span
									class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {role.is_system_role
										? 'bg-primary text-primary-foreground'
										: 'bg-secondary text-secondary-foreground'}"
								>
									{role.name}
								</span>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">No roles assigned</p>
					{/if}
				</div>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={handleClose}>Close</Button>
				<Button onclick={handleEdit}>Edit User</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
