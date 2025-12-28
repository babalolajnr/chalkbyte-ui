<script lang="ts">
	import type { Snippet } from 'svelte';
	import { permissionsStore } from '$lib/stores/permissions.store';
	import type { SystemRoleType } from '$lib/types/permissions';

	interface Props {
		/** Single role or array of roles to check */
		role: SystemRoleType | SystemRoleType[];
		/** If true, user must have ALL roles. If false, user needs ANY one role */
		requireAll?: boolean;
		/** Content to render when user has the role */
		children: Snippet;
		/** Fallback content when user lacks the role */
		fallback?: Snippet;
	}

	let { role, requireAll = false, children, fallback }: Props = $props();

	const hasAccess = $derived.by(() => {
		const roles = Array.isArray(role) ? role : [role];
		if (roles.length === 0) return true;

		const userRoleNames = $permissionsStore.roles.map((r) => r.name);

		if (requireAll) {
			return roles.every((r) => userRoleNames.includes(r));
		} else {
			return roles.some((r) => userRoleNames.includes(r));
		}
	});
</script>

{#if hasAccess}
	{@render children()}
{:else if fallback}
	{@render fallback()}
{/if}
