<script lang="ts">
	import type { Snippet } from 'svelte';
	import { permissionsStore } from '$lib/stores/permissions.store';
	import { authStore } from '$lib/stores/auth.store';
	import type { SystemPermissionType, SystemRoleType } from '$lib/types/permissions';

	interface Props {
		/** Single permission or array of permissions to check */
		permission?: SystemPermissionType | SystemPermissionType[] | string | string[];
		/** Single role or array of roles to check */
		role?: SystemRoleType | SystemRoleType[] | string | string[];
		/** If true, user must have ALL permissions/roles. If false, user needs ANY one */
		requireAll?: boolean;
		/** Custom authorization check function */
		check?: () => boolean;
		/** Whether to also check if user is authenticated (default: true) */
		requireAuth?: boolean;
		/** Content to render when authorized */
		children: Snippet;
		/** Fallback content when not authorized */
		fallback?: Snippet;
		/** Content to render while loading permissions */
		loading?: Snippet;
	}

	let {
		permission,
		role,
		requireAll = true,
		check,
		requireAuth = true,
		children,
		fallback,
		loading
	}: Props = $props();

	const isLoading = $derived($permissionsStore.isLoading);

	const isAuthenticated = $derived($authStore.isAuthenticated);

	const hasPermissionAccess = $derived.by(() => {
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

	const hasRoleAccess = $derived.by(() => {
		if (!role) return true;

		const roles = Array.isArray(role) ? role : [role];
		if (roles.length === 0) return true;

		const userRoleNames = $permissionsStore.roles.map((r) => r.name);

		if (requireAll) {
			return roles.every((r) => userRoleNames.includes(r));
		} else {
			return roles.some((r) => userRoleNames.includes(r));
		}
	});

	const passesCustomCheck = $derived.by(() => {
		if (!check) return true;
		return check();
	});

	const isAuthorized = $derived.by(() => {
		// Check authentication if required
		if (requireAuth && !isAuthenticated) {
			return false;
		}

		// All checks must pass
		return hasPermissionAccess && hasRoleAccess && passesCustomCheck;
	});
</script>

{#if isLoading && loading}
	{@render loading()}
{:else if isAuthorized}
	{@render children()}
{:else if fallback}
	{@render fallback()}
{/if}
