<script lang="ts">
	import type { Snippet } from 'svelte';
	import { permissionsStore } from '$lib/stores/permissions.store';
	import type { SystemPermissionType } from '$lib/types/permissions';

	interface Props {
		/** Single permission or array of permissions to check */
		permission?: SystemPermissionType | SystemPermissionType[];
		/** If true, user must have ALL permissions. If false, user needs ANY one permission */
		requireAll?: boolean;
		/** Content to render when user has permission */
		children: Snippet;
		/** Fallback content when user lacks permission */
		fallback?: Snippet;
	}

	let { permission, requireAll = true, children, fallback }: Props = $props();

	const hasAccess = $derived.by(() => {
		if (!permission) return true;

		const permissions = Array.isArray(permission) ? permission : [permission];
		if (permissions.length === 0) return true;

		const userPermissionNames = $permissionsStore.permissions.map((p) => p.name);

		if (requireAll) {
			return permissions.every((p) => userPermissionNames.includes(p));
		} else {
			return permissions.some((p) => userPermissionNames.includes(p));
		}
	});
</script>

{#if hasAccess}
	{@render children()}
{:else if fallback}
	{@render fallback()}
{/if}
