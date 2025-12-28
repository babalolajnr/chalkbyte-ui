import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/auth.store';
import {
	permissionsStore,
	hasPermission,
	hasAnyPermission,
	hasAllPermissions,
	hasRole,
	hasAnyRole
} from '$lib/stores/permissions.store';
import {
	RoutePermissions,
	FeaturePermissions,
	type SystemPermissionType,
	type FeatureKey
} from '$lib/types/permissions';

export interface PermissionCheckResult {
	allowed: boolean;
	missingPermissions: string[];
}

/**
 * Check if the current user has access to a specific route
 */
export function canAccessRoute(route: string): PermissionCheckResult {
	const auth = get(authStore);

	if (!auth.isAuthenticated) {
		return { allowed: false, missingPermissions: ['authentication_required'] };
	}

	const requiredPermissions = RoutePermissions[route];

	// No permissions required for this route
	if (!requiredPermissions || requiredPermissions.length === 0) {
		return { allowed: true, missingPermissions: [] };
	}

	const state = get(permissionsStore);
	const userPermissionNames = state.permissions.map((p) => p.name);
	const missingPermissions = requiredPermissions.filter((p) => !userPermissionNames.includes(p));

	return {
		allowed: missingPermissions.length === 0,
		missingPermissions
	};
}

/**
 * Check if the current user has access to a specific feature
 */
export function canAccessFeature(feature: FeatureKey): PermissionCheckResult {
	const auth = get(authStore);

	if (!auth.isAuthenticated) {
		return { allowed: false, missingPermissions: ['authentication_required'] };
	}

	const requiredPermissions = FeaturePermissions[feature];

	// No permissions required for this feature
	if (!requiredPermissions || requiredPermissions.length === 0) {
		return { allowed: true, missingPermissions: [] };
	}

	const state = get(permissionsStore);
	const userPermissionNames = state.permissions.map((p) => p.name);
	const missingPermissions = requiredPermissions.filter((p) => !userPermissionNames.includes(p));

	return {
		allowed: missingPermissions.length === 0,
		missingPermissions
	};
}

/**
 * Navigate to route if user has permission, otherwise redirect to unauthorized page
 */
export function requirePermission(
	permission: SystemPermissionType | SystemPermissionType[],
	options?: { redirectTo?: '/(app)/unauthorized' | '/(app)/dashboard' | '/' }
): boolean {
	const auth = get(authStore);
	const redirectTo = options?.redirectTo ?? '/(app)/unauthorized';

	if (!auth.isAuthenticated) {
		goto(resolve('/(auth)/login'));
		return false;
	}

	const permissions = Array.isArray(permission) ? permission : [permission];
	const hasAccess = hasAllPermissions(permissions);

	if (!hasAccess) {
		goto(resolve(redirectTo));
		return false;
	}

	return true;
}

/**
 * Require at least one of the specified permissions
 */
export function requireAnyPermission(
	permissions: SystemPermissionType[],
	options?: { redirectTo?: '/(app)/unauthorized' | '/(app)/dashboard' | '/' }
): boolean {
	const auth = get(authStore);
	const redirectTo = options?.redirectTo ?? '/(app)/unauthorized';

	if (!auth.isAuthenticated) {
		goto(resolve('/(auth)/login'));
		return false;
	}

	const hasAccess = hasAnyPermission(permissions);

	if (!hasAccess) {
		goto(resolve(redirectTo));
		return false;
	}

	return true;
}

/**
 * Require a specific role
 */
export function requireRoleGuard(
	role: string | string[],
	options?: { redirectTo?: '/(app)/unauthorized' | '/(app)/dashboard' | '/' }
): boolean {
	const auth = get(authStore);
	const redirectTo = options?.redirectTo ?? '/(app)/unauthorized';

	if (!auth.isAuthenticated) {
		goto(resolve('/(auth)/login'));
		return false;
	}

	const roles = Array.isArray(role) ? role : [role];
	const hasAccess = hasAnyRole(roles);

	if (!hasAccess) {
		goto(resolve(redirectTo));
		return false;
	}

	return true;
}

/**
 * Guard a route based on route permissions mapping
 */
export function guardRoute(
	route: string,
	options?: { redirectTo?: '/(app)/unauthorized' | '/(app)/dashboard' | '/' }
): boolean {
	const result = canAccessRoute(route);
	const redirectTo = options?.redirectTo ?? '/(app)/unauthorized';

	if (!result.allowed) {
		const auth = get(authStore);
		if (!auth.isAuthenticated) {
			goto(resolve('/(auth)/login'));
		} else {
			goto(resolve(redirectTo));
		}
		return false;
	}

	return true;
}

/**
 * Guard a feature based on feature permissions mapping
 */
export function guardFeature(
	feature: FeatureKey,
	options?: { redirectTo?: '/(app)/unauthorized' | '/(app)/dashboard' | '/' }
): boolean {
	const result = canAccessFeature(feature);
	const redirectTo = options?.redirectTo ?? '/(app)/unauthorized';

	if (!result.allowed) {
		const auth = get(authStore);
		if (!auth.isAuthenticated) {
			goto(resolve('/(auth)/login'));
		} else {
			goto(resolve(redirectTo));
		}
		return false;
	}

	return true;
}

// Re-export utility functions for convenience
export { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole };
