<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import type { Permission } from '$lib/types/roles';

	let { permissions = [] }: { permissions: Permission[] } = $props();

	const count = permissions.length;

	const groupedPermissions = $derived.by(() => {
		return permissions.reduce(
			(acc, permission) => {
				if (!acc[permission.category]) {
					acc[permission.category] = [];
				}
				acc[permission.category].push(permission);
				return acc;
			},
			{} as Record<string, Permission[]>
		);
	});
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		<span class="cursor-default rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
			{count} permission{count !== 1 ? 's' : ''}
		</span>
	</Tooltip.Trigger>
	<Tooltip.Portal>
		<Tooltip.Content class="max-w-xs">
			{#if count === 0}
				<p class="text-sm text-muted-foreground">No permissions assigned</p>
			{:else}
				<div class="space-y-2">
					{#each Object.entries(groupedPermissions) as [category, perms] (category)}
						<div>
							<p class="text-xs font-semibold capitalize">{category}</p>
							<ul class="ml-2 text-xs text-muted-foreground">
								{#each perms as perm (perm.id)}
									<li>{perm.name}</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			{/if}
		</Tooltip.Content>
	</Tooltip.Portal>
</Tooltip.Root>
