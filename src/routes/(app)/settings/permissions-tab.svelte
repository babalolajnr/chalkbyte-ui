<script lang="ts">
	import { permissionsStore } from '$lib/stores/permissions.store';
	import * as Card from '$lib/components/ui/card';
	import KeyIcon from '@lucide/svelte/icons/key';
</script>

<div class="space-y-4">
	<Card.Root>
		<Card.Header>
			<Card.Title>Your Roles</Card.Title>
			<Card.Description>Roles assigned to your account</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if $permissionsStore.isLoading}
				<p class="text-muted-foreground">Loading roles...</p>
			{:else if $permissionsStore.roles.length === 0}
				<p class="text-muted-foreground">No roles assigned</p>
			{:else}
				<div class="space-y-3">
					{#each $permissionsStore.roles as role (role.id)}
						<div class="rounded-lg border p-4">
							<div class="flex items-center justify-between">
								<div>
									<p class="font-medium">{role.name}</p>
									{#if role.description}
										<p class="text-sm text-muted-foreground">{role.description}</p>
									{/if}
								</div>
								{#if role.is_system_role}
									<span
										class="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
									>
										System Role
									</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Your Permissions</Card.Title>
			<Card.Description>Permissions granted through your roles</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if $permissionsStore.isLoading}
				<p class="text-muted-foreground">Loading permissions...</p>
			{:else if $permissionsStore.permissions.length === 0}
				<p class="text-muted-foreground">No permissions assigned</p>
			{:else}
				{@const groupedPermissions = $permissionsStore.permissions.reduce(
					(acc, perm) => {
						const category = perm.category || 'Other';
						if (!acc[category]) acc[category] = [];
						acc[category].push(perm);
						return acc;
					},
					{} as Record<string, typeof $permissionsStore.permissions>
				)}
				<div class="space-y-6">
					{#each Object.entries(groupedPermissions) as [category, permissions] (category)}
						<div>
							<h4
								class="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase"
							>
								{category}
							</h4>
							<div class="grid gap-2 sm:grid-cols-2">
								{#each permissions as permission (permission.id)}
									<div class="flex items-start gap-2 rounded-md border p-3">
										<KeyIcon class="mt-0.5 h-4 w-4 text-primary" />
										<div>
											<p class="text-sm font-medium">{permission.name}</p>
											{#if permission.description}
												<p class="text-xs text-muted-foreground">{permission.description}</p>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
