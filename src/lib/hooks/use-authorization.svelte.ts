import { derived, get, type Readable } from 'svelte/store';
import { permissionsStore } from '$lib/stores/permissions.store';
import { authStore } from '$lib/stores/auth.store';
import {
	SystemPermission,
	FeaturePermissions,
	RoutePermissions,
	type FeatureKey,
	type PermissionString
} from '$lib/types/permissions';
import type { Permission, CustomRoleWithPermissions } from '$lib/types/roles';

/**
 * Get current authorization state (non-reactive, point-in-time snapshot)
 */
export function getAuthorizationState() {
	const permState = get(permissionsStore);
	const authState = get(authStore);

	return {
		permissions: permState.permissions,
		roles: permState.roles,
		permissionNames: permState.permissions.map((p) => p.name),
		roleNames: permState.roles.map((r) => r.name),
		isLoading: permState.isLoading,
		error: permState.error,
		isAuthenticated: authState.isAuthenticated,
		user: authState.user
	};
}

/**
 * Authorization hook for Svelte 5
 * Provides permission and role checking utilities
 */
export function useAuthorization() {
	/**
	 * Check if user has a specific permission
	 */
	function can(permission: PermissionString): boolean {
		const { permissionNames } = getAuthorizationState();
		return permissionNames.includes(permission);
	}

	/**
	 * Check if user has any of the specified permissions
	 */
	function canAny(permissionList: PermissionString[]): boolean {
		const { permissionNames } = getAuthorizationState();
		return permissionList.some((p) => permissionNames.includes(p));
	}

	/**
	 * Check if user has all of the specified permissions
	 */
	function canAll(permissionList: PermissionString[]): boolean {
		const { permissionNames } = getAuthorizationState();
		return permissionList.every((p) => permissionNames.includes(p));
	}

	/**
	 * Check if user has a specific role
	 */
	function hasRole(roleName: string): boolean {
		const { roleNames } = getAuthorizationState();
		return roleNames.includes(roleName);
	}

	/**
	 * Check if user has any of the specified roles
	 */
	function hasAnyRole(roleList: string[]): boolean {
		const { roleNames } = getAuthorizationState();
		return roleList.some((r) => roleNames.includes(r));
	}

	/**
	 * Check if user has all of the specified roles
	 */
	function hasAllRoles(roleList: string[]): boolean {
		const { roleNames } = getAuthorizationState();
		return roleList.every((r) => roleNames.includes(r));
	}

	/**
	 * Check if user can access a specific feature
	 */
	function canAccessFeature(feature: FeatureKey): boolean {
		const { isAuthenticated, permissionNames } = getAuthorizationState();
		if (!isAuthenticated) return false;

		const requiredPermissions = FeaturePermissions[feature];
		if (!requiredPermissions || requiredPermissions.length === 0) return true;

		return requiredPermissions.every((p) => permissionNames.includes(p));
	}

	/**
	 * Check if user can access a specific route
	 */
	function canAccessRoute(route: string): boolean {
		const { isAuthenticated, permissionNames } = getAuthorizationState();
		if (!isAuthenticated) return false;

		const requiredPermissions = RoutePermissions[route];
		if (!requiredPermissions || requiredPermissions.length === 0) return true;

		return requiredPermissions.every((p) => permissionNames.includes(p));
	}

	/**
	 * Get permissions by category
	 */
	function getPermissionsByCategory(category: string): Permission[] {
		const { permissions } = getAuthorizationState();
		return permissions.filter((p: Permission) => p.category === category);
	}

	/**
	 * Check if user has any permission in a category
	 */
	function hasAnyPermissionInCategory(category: string): boolean {
		const { permissions } = getAuthorizationState();
		return permissions.some((p: Permission) => p.category === category);
	}

	// Resource-specific CRUD helpers
	const users = {
		canCreate: () => can(SystemPermission.USERS_CREATE),
		canRead: () => can(SystemPermission.USERS_READ),
		canUpdate: () => can(SystemPermission.USERS_UPDATE),
		canDelete: () => can(SystemPermission.USERS_DELETE),
		canManage: () => can(SystemPermission.USERS_MANAGE)
	};

	const schools = {
		canCreate: () => can(SystemPermission.SCHOOLS_CREATE),
		canRead: () => can(SystemPermission.SCHOOLS_READ),
		canUpdate: () => can(SystemPermission.SCHOOLS_UPDATE),
		canDelete: () => can(SystemPermission.SCHOOLS_DELETE),
		canManage: () => can(SystemPermission.SCHOOLS_MANAGE)
	};

	const students = {
		canCreate: () => can(SystemPermission.STUDENTS_CREATE),
		canRead: () => can(SystemPermission.STUDENTS_READ),
		canUpdate: () => can(SystemPermission.STUDENTS_UPDATE),
		canDelete: () => can(SystemPermission.STUDENTS_DELETE),
		canManage: () => can(SystemPermission.STUDENTS_MANAGE),
		canExport: () => can(SystemPermission.STUDENTS_EXPORT),
		canImport: () => can(SystemPermission.STUDENTS_IMPORT)
	};

	const levels = {
		canCreate: () => can(SystemPermission.LEVELS_CREATE),
		canRead: () => can(SystemPermission.LEVELS_READ),
		canUpdate: () => can(SystemPermission.LEVELS_UPDATE),
		canDelete: () => can(SystemPermission.LEVELS_DELETE),
		canAssignStudents: () => can(SystemPermission.LEVELS_ASSIGN_STUDENTS)
	};

	const branches = {
		canCreate: () => can(SystemPermission.BRANCHES_CREATE),
		canRead: () => can(SystemPermission.BRANCHES_READ),
		canUpdate: () => can(SystemPermission.BRANCHES_UPDATE),
		canDelete: () => can(SystemPermission.BRANCHES_DELETE),
		canAssignStudents: () => can(SystemPermission.BRANCHES_ASSIGN_STUDENTS)
	};

	const rolesAuth = {
		canCreate: () => can(SystemPermission.ROLES_CREATE),
		canRead: () => can(SystemPermission.ROLES_READ),
		canUpdate: () => can(SystemPermission.ROLES_UPDATE),
		canDelete: () => can(SystemPermission.ROLES_DELETE),
		canAssign: () => can(SystemPermission.ROLES_ASSIGN),
		canManage: () => can(SystemPermission.ROLES_MANAGE)
	};

	const reports = {
		canView: () => can(SystemPermission.REPORTS_VIEW),
		canExport: () => can(SystemPermission.REPORTS_EXPORT),
		canCreate: () => can(SystemPermission.REPORTS_CREATE),
		canRead: () => can(SystemPermission.REPORTS_READ)
	};

	const settings = {
		canRead: () => can(SystemPermission.SETTINGS_READ),
		canUpdate: () => can(SystemPermission.SETTINGS_UPDATE),
		canManage: () => can(SystemPermission.SETTINGS_MANAGE)
	};

	return {
		// State getter
		getState: getAuthorizationState,

		// Permission checks
		can,
		canAny,
		canAll,

		// Role checks
		hasRole,
		hasAnyRole,
		hasAllRoles,

		// Feature/Route access
		canAccessFeature,
		canAccessRoute,

		// Utilities
		getPermissionsByCategory,
		hasAnyPermissionInCategory,

		// Resource-specific helpers
		users,
		schools,
		students,
		levels,
		branches,
		roles: rolesAuth,
		reports,
		settings
	};
}

/**
 * Create a reactive permission check store
 */
export function createReactivePermissionCheck(permission: PermissionString): Readable<boolean> {
	return derived(permissionsStore, ($store) =>
		$store.permissions.some((p: Permission) => p.name === permission)
	);
}

/**
 * Create a reactive check for multiple permissions (ANY)
 */
export function createReactiveAnyPermissionCheck(
	permissions: PermissionString[]
): Readable<boolean> {
	return derived(permissionsStore, ($store) => {
		const userPermNames = $store.permissions.map((p: Permission) => p.name);
		return permissions.some((p) => userPermNames.includes(p));
	});
}

/**
 * Create a reactive check for multiple permissions (ALL)
 */
export function createReactiveAllPermissionsCheck(
	permissions: PermissionString[]
): Readable<boolean> {
	return derived(permissionsStore, ($store) => {
		const userPermNames = $store.permissions.map((p: Permission) => p.name);
		return permissions.every((p) => userPermNames.includes(p));
	});
}

/**
 * Create a reactive role check
 */
export function createReactiveRoleCheck(role: string): Readable<boolean> {
	return derived(permissionsStore, ($store) =>
		$store.roles.some((r: CustomRoleWithPermissions) => r.name === role)
	);
}

/**
 * Create a reactive authorization check with multiple conditions
 */
export function createReactiveAuthCheck(options: {
	permissions?: PermissionString[];
	roles?: string[];
	requireAll?: boolean;
}): Readable<{ allowed: boolean; isAuthenticated: boolean }> {
	const {
		permissions: requiredPermissions = [],
		roles: requiredRoles = [],
		requireAll = true
	} = options;

	return derived([authStore, permissionsStore], ([$auth, $perms]) => {
		const isAuthenticated = $auth.isAuthenticated;

		if (!isAuthenticated) {
			return { allowed: false, isAuthenticated: false };
		}

		const userPermNames = $perms.permissions.map((p: Permission) => p.name);
		const userRoleNames = $perms.roles.map((r: CustomRoleWithPermissions) => r.name);

		const hasPermissions =
			requiredPermissions.length === 0 ||
			(requireAll
				? requiredPermissions.every((p) => userPermNames.includes(p))
				: requiredPermissions.some((p) => userPermNames.includes(p)));

		const hasRoles =
			requiredRoles.length === 0 ||
			(requireAll
				? requiredRoles.every((r) => userRoleNames.includes(r))
				: requiredRoles.some((r) => userRoleNames.includes(r)));

		return {
			allowed: hasPermissions && hasRoles,
			isAuthenticated: true
		};
	});
}

/**
 * Create a reactive feature access check
 */
export function createReactiveFeatureCheck(feature: FeatureKey): Readable<boolean> {
	const requiredPermissions = FeaturePermissions[feature];

	return derived([authStore, permissionsStore], ([$auth, $perms]) => {
		if (!$auth.isAuthenticated) return false;
		if (!requiredPermissions || requiredPermissions.length === 0) return true;

		const userPermNames = $perms.permissions.map((p: Permission) => p.name);
		return requiredPermissions.every((p) => userPermNames.includes(p));
	});
}

/**
 * Create a reactive route access check
 */
export function createReactiveRouteCheck(route: string): Readable<boolean> {
	const requiredPermissions = RoutePermissions[route];

	return derived([authStore, permissionsStore], ([$auth, $perms]) => {
		if (!$auth.isAuthenticated) return false;
		if (!requiredPermissions || requiredPermissions.length === 0) return true;

		const userPermNames = $perms.permissions.map((p: Permission) => p.name);
		return requiredPermissions.every((p) => userPermNames.includes(p));
	});
}
