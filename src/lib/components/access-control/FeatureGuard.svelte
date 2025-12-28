<script lang="ts">
	import type { Snippet } from 'svelte';
	import { permissionsStore } from '$lib/stores/permissions.store';
	import { FeaturePermissions, type FeatureKey } from '$lib/types/permissions';

	interface Props {
		/** Feature key to check access for */
		feature: FeatureKey;
		/** Content to render when user has access to the feature */
		children: Snippet;
		/** Fallback content when user lacks access */
		fallback?: Snippet;
	}

	let { feature, children, fallback }: Props = $props();

	const hasAccess = $derived.by(() => {
		const requiredPermissions = FeaturePermissions[feature];

		// No permissions required for this feature
		if (!requiredPermissions || requiredPermissions.length === 0) {
			return true;
		}

		const userPermissionNames = $permissionsStore.permissions.map((p) => p.name);
		return requiredPermissions.every((p) => userPermissionNames.includes(p));
	});
</script>

{#if hasAccess}
	{@render children()}
{:else if fallback}
	{@render fallback()}
{/if}
