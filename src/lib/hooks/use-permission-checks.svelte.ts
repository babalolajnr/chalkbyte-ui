import { get, derived, type Readable } from 'svelte/store';
import { permissionsStore } from '$lib/stores/permissions.store';
import { authStore } from '$lib/stores/auth.store';
import {
	FeaturePermissions,
	RoutePermissions,
	type SystemPermissionType,
	type FeatureKey,
	type SystemRoleType
} from '$lib/types/permissions';
import type { Permission, CustomRoleWithPermissions } from '$lib/types/roles';

/**
 * Reactive permission checking hook
 * Returns reactive state for checking user permissions
 */
export function usePermissions() {
	function getState() {
		const permState = get(permissionsStore);
		const authState = get(authStore);
		return { permState, authState };
	}

	/**
	 * Check if user has a specific permission
	 */
	function hasPermission(permission: SystemPermissionType): boolean {
		const { permState } = getState();
		return permState.permissions.some((p: Permission) => p.name === permission);
	}

	/**
	 * Check if user has ANY of the specified permissions
	 */
	function hasAnyPermission(permissionList: SystemPermissionType[]): boolean {
		const { permState } = getState();
		const permissionNames = permState.permissions.map((p: Permission) => p.name);
		return permissionList.some((p) => permissionNames.includes(p));
	}

	/**
	 * Check if user has ALL of the specified permissions
	 */
	function hasAllPermissions(permissionList: SystemPermissionType[]): boolean {
		const { permState } = getState();
		const permissionNames = permState.permissions.map((p: Permission) => p.name);
		return permissionList.every((p) => permissionNames.includes(p));
	}

	/**
	 * Check if user has a specific role
	 */
	function hasRole(role: SystemRoleType): boolean {
		const { permState } = getState();
		return permState.roles.some((r: CustomRoleWithPermissions) => r.name === role);
	}

	/**
	 * Check if user has ANY of the specified roles
	 */
	function hasAnyRole(roleList: SystemRoleType[]): boolean {
		const { permState } = getState();
		const roleNames = permState.roles.map((r: CustomRoleWithPermissions) => r.name);
		return roleList.some((r) => roleNames.includes(r));
	}

	/**
	 * Check if user has ALL of the specified roles
	 */
	function hasAllRoles(roleList: SystemRoleType[]): boolean {
		const { permState } = getState();
		const roleNames = permState.roles.map((r: CustomRoleWithPermissions) => r.name);
		return roleList.every((r) => roleNames.includes(r));
	}

	/**
	 * Check if user can access a specific feature
	 */
	function canAccessFeature(feature: FeatureKey): boolean {
		const { permState, authState } = getState();
		if (!authState.isAuthenticated) return false;

		const requiredPermissions = FeaturePermissions[feature];
		if (!requiredPermissions || requiredPermissions.length === 0) return true;

		const permissionNames = permState.permissions.map((p: Permission) => p.name);
		return requiredPermissions.every((p) => permissionNames.includes(p));
	}

	/**
	 * Check if user can access a specific route
	 */
	function canAccessRoute(route: string): boolean {
		const { permState, authState } = getState();
		if (!authState.isAuthenticated) return false;

		const requiredPermissions = RoutePermissions[route];
		if (!requiredPermissions || requiredPermissions.length === 0) return true;

		const permissionNames = permState.permissions.map((p: Permission) => p.name);
		return requiredPermissions.every((p) => permissionNames.includes(p));
	}

	/**
	 * Get all permissions for a specific category
	 */
	function getPermissionsByCategory(category: string): Permission[] {
		const { permState } = getState();
		return permState.permissions.filter((p: Permission) => p.category === category);
	}

	/**
	 * Get current state snapshot
	 */
	function getSnapshot() {
		const { permState, authState } = getState();
		return {
			isAuthenticated: authState.isAuthenticated,
			permissions: permState.permissions,
			roles: permState.roles,
			isLoading: permState.isLoading,
			error: permState.error,
			permissionNames: permState.permissions.map((p: Permission) => p.name),
			roleNames: permState.roles.map((r: CustomRoleWithPermissions) => r.name)
		};
	}

	return {
		// State snapshot
		getSnapshot,

		// Permission checks
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,

		// Role checks
		hasRole,
		hasAnyRole,
		hasAllRoles,

		// Feature/Route access
		canAccessFeature,
		canAccessRoute,

		// Utilities
		getPermissionsByCategory
	};
}

/**
 * Create a reactive permission check store
 * Returns a readable store that updates when permissions change
 */
export function createPermissionCheck(permission: SystemPermissionType): Readable<boolean> {
	return derived(permissionsStore, ($store) =>
		$store.permissions.some((p: Permission) => p.name === permission)
	);
}

/**
 * Create a reactive check for multiple permissions (ANY)
 */
export function createAnyPermissionCheck(permissions: SystemPermissionType[]): Readable<boolean> {
	return derived(permissionsStore, ($store) =>
		permissions.some((permission) =>
			$store.permissions.some((p: Permission) => p.name === permission)
		)
	);
}

/**
 * Create a reactive check for multiple permissions (ALL)
 */
export function createAllPermissionsCheck(permissions: SystemPermissionType[]): Readable<boolean> {
	return derived(permissionsStore, ($store) =>
		permissions.every((permission) =>
			$store.permissions.some((p: Permission) => p.name === permission)
		)
	);
}

/**
 * Create a reactive role check
 */
export function createRoleCheck(role: SystemRoleType): Readable<boolean> {
	return derived(permissionsStore, ($store) =>
		$store.roles.some((r: CustomRoleWithPermissions) => r.name === role)
	);
}

/**
 * Create a reactive feature access check
 */
export function createFeatureCheck(feature: FeatureKey): Readable<boolean> {
	const requiredPermissions = FeaturePermissions[feature];

	return derived([authStore, permissionsStore], ([$auth, $perms]) => {
		if (!$auth.isAuthenticated) return false;
		if (!requiredPermissions || requiredPermissions.length === 0) return true;

		const userPermissionNames = $perms.permissions.map((p: Permission) => p.name);
		return requiredPermissions.every((p) => userPermissionNames.includes(p));
	});
}

/**
 * Create a reactive route access check
 */
export function createRouteCheck(route: string): Readable<boolean> {
	const requiredPermissions = RoutePermissions[route];

	return derived([authStore, permissionsStore], ([$auth, $perms]) => {
		if (!$auth.isAuthenticated) return false;
		if (!requiredPermissions || requiredPermissions.length === 0) return true;

		const userPermissionNames = $perms.permissions.map((p: Permission) => p.name);
		return requiredPermissions.every((p) => userPermissionNames.includes(p));
	});
}
