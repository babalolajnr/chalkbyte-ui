import { get } from 'svelte/store';
import {
	permissionsStore,
	hasPermission,
	hasAnyPermission,
	hasAllPermissions,
	hasRole,
	hasAnyRole
} from '$lib/stores/permissions.store';
import { authStore } from '$lib/stores/auth.store';
import {
	SystemPermission,
	type SystemPermissionType,
	type PermissionString,
	RoutePermissions,
	FeaturePermissions,
	type FeatureKey
} from '$lib/types/permissions';
import type { Permission } from '$lib/types/roles';

export interface AuthorizationResult {
	allowed: boolean;
	reason?: string;
	missingPermissions?: string[];
}

export interface AuthorizationContext {
	userId?: string;
	resourceOwnerId?: string;
	schoolId?: string;
	additionalContext?: Record<string, unknown>;
}

/**
 * Authorization class for checking user permissions and access control
 */
export class Authorization {
	/**
	 * Check if user has a specific permission
	 */
	static can(permission: PermissionString): boolean {
		return hasPermission(permission);
	}

	/**
	 * Check if user has any of the specified permissions
	 */
	static canAny(permissions: PermissionString[]): boolean {
		return hasAnyPermission(permissions);
	}

	/**
	 * Check if user has all of the specified permissions
	 */
	static canAll(permissions: PermissionString[]): boolean {
		return hasAllPermissions(permissions);
	}

	/**
	 * Check if user has a specific role
	 */
	static hasRole(roleName: string): boolean {
		return hasRole(roleName);
	}

	/**
	 * Check if user has any of the specified roles
	 */
	static hasAnyRole(roleNames: string[]): boolean {
		return hasAnyRole(roleNames);
	}

	/**
	 * Check if user is authenticated
	 */
	static isAuthenticated(): boolean {
		const auth = get(authStore);
		return auth.isAuthenticated;
	}

	/**
	 * Get current user's permissions
	 */
	static getPermissions(): Permission[] {
		const state = get(permissionsStore);
		return state.permissions;
	}

	/**
	 * Get current user's permission names
	 */
	static getPermissionNames(): string[] {
		return this.getPermissions().map((p) => p.name);
	}

	/**
	 * Check authorization with detailed result
	 */
	static authorize(
		permission: PermissionString | readonly PermissionString[],
		mode: 'all' | 'any' = 'all'
	): AuthorizationResult {
		if (!this.isAuthenticated()) {
			return {
				allowed: false,
				reason: 'User is not authenticated'
			};
		}

		const permissions = Array.isArray(permission) ? permission : [permission];
		const userPermissions = this.getPermissionNames();
		const missingPermissions = permissions.filter((p) => !userPermissions.includes(p));

		if (mode === 'all' && missingPermissions.length > 0) {
			return {
				allowed: false,
				reason: 'Missing required permissions',
				missingPermissions
			};
		}

		if (mode === 'any' && missingPermissions.length === permissions.length) {
			return {
				allowed: false,
				reason: 'None of the required permissions are present',
				missingPermissions
			};
		}

		return { allowed: true };
	}

	/**
	 * Check if user can access a specific route
	 */
	static canAccessRoute(route: string): AuthorizationResult {
		if (!this.isAuthenticated()) {
			return {
				allowed: false,
				reason: 'User is not authenticated'
			};
		}

		const requiredPermissions = RoutePermissions[route];
		if (!requiredPermissions || requiredPermissions.length === 0) {
			return { allowed: true };
		}

		return this.authorize(requiredPermissions, 'all');
	}

	/**
	 * Check if user can access a specific feature
	 */
	static canAccessFeature(feature: FeatureKey): AuthorizationResult {
		if (!this.isAuthenticated()) {
			return {
				allowed: false,
				reason: 'User is not authenticated'
			};
		}

		const requiredPermissions = FeaturePermissions[feature];
		if (!requiredPermissions || requiredPermissions.length === 0) {
			return { allowed: true };
		}

		return this.authorize(requiredPermissions, 'all');
	}

	/**
	 * Check CRUD permissions for a resource
	 */
	static canCreate(resource: string): boolean {
		return this.can(`${resource}:create` as PermissionString);
	}

	static canRead(resource: string): boolean {
		return this.can(`${resource}:read` as PermissionString);
	}

	static canUpdate(resource: string): boolean {
		return this.can(`${resource}:update` as PermissionString);
	}

	static canDelete(resource: string): boolean {
		return this.can(`${resource}:delete` as PermissionString);
	}

	static canManage(resource: string): boolean {
		return this.can(`${resource}:manage` as PermissionString);
	}

	/**
	 * Check if user can perform action on resource with ownership check
	 */
	static canWithOwnership(
		permission: PermissionString,
		context: AuthorizationContext
	): AuthorizationResult {
		if (!this.isAuthenticated()) {
			return {
				allowed: false,
				reason: 'User is not authenticated'
			};
		}

		// If user has the permission directly, allow
		if (this.can(permission)) {
			return { allowed: true };
		}

		// Check if user owns the resource
		const auth = get(authStore);
		if (context.resourceOwnerId && auth.user?.id === context.resourceOwnerId) {
			return { allowed: true };
		}

		return {
			allowed: false,
			reason: 'User does not have permission and is not the resource owner',
			missingPermissions: [permission]
		};
	}

	/**
	 * Get all permissions for a category
	 */
	static getPermissionsByCategory(category: string): Permission[] {
		const permissions = this.getPermissions();
		return permissions.filter((p) => p.category === category);
	}

	/**
	 * Check if user has any permission in a category
	 */
	static hasAnyPermissionInCategory(category: string): boolean {
		return this.getPermissionsByCategory(category).length > 0;
	}
}

/**
 * Permission checker function factory
 * Creates a function that checks for a specific permission
 */
export function createPermissionChecker(permission: PermissionString): () => boolean {
	return () => Authorization.can(permission);
}

/**
 * Create a guard function for a permission
 */
export function createPermissionGuard(
	permission: PermissionString | PermissionString[],
	mode: 'all' | 'any' = 'all'
): () => AuthorizationResult {
	return () => Authorization.authorize(permission, mode);
}

/**
 * Shorthand permission check functions
 */
export const can = Authorization.can.bind(Authorization);
export const canAny = Authorization.canAny.bind(Authorization);
export const canAll = Authorization.canAll.bind(Authorization);

/**
 * Resource-specific authorization helpers
 */
export const Users = {
	canCreate: () => Authorization.can(SystemPermission.USERS_CREATE),
	canRead: () => Authorization.can(SystemPermission.USERS_READ),
	canUpdate: () => Authorization.can(SystemPermission.USERS_UPDATE),
	canDelete: () => Authorization.can(SystemPermission.USERS_DELETE),
	canManage: () => Authorization.can(SystemPermission.USERS_MANAGE)
};

export const Schools = {
	canCreate: () => Authorization.can(SystemPermission.SCHOOLS_CREATE),
	canRead: () => Authorization.can(SystemPermission.SCHOOLS_READ),
	canUpdate: () => Authorization.can(SystemPermission.SCHOOLS_UPDATE),
	canDelete: () => Authorization.can(SystemPermission.SCHOOLS_DELETE),
	canManage: () => Authorization.can(SystemPermission.SCHOOLS_MANAGE)
};

export const Students = {
	canCreate: () => Authorization.can(SystemPermission.STUDENTS_CREATE),
	canRead: () => Authorization.can(SystemPermission.STUDENTS_READ),
	canUpdate: () => Authorization.can(SystemPermission.STUDENTS_UPDATE),
	canDelete: () => Authorization.can(SystemPermission.STUDENTS_DELETE),
	canManage: () => Authorization.can(SystemPermission.STUDENTS_MANAGE),
	canExport: () => Authorization.can(SystemPermission.STUDENTS_EXPORT),
	canImport: () => Authorization.can(SystemPermission.STUDENTS_IMPORT)
};

export const Levels = {
	canCreate: () => Authorization.can(SystemPermission.LEVELS_CREATE),
	canRead: () => Authorization.can(SystemPermission.LEVELS_READ),
	canUpdate: () => Authorization.can(SystemPermission.LEVELS_UPDATE),
	canDelete: () => Authorization.can(SystemPermission.LEVELS_DELETE),
	canAssignStudents: () => Authorization.can(SystemPermission.LEVELS_ASSIGN_STUDENTS)
};

export const Branches = {
	canCreate: () => Authorization.can(SystemPermission.BRANCHES_CREATE),
	canRead: () => Authorization.can(SystemPermission.BRANCHES_READ),
	canUpdate: () => Authorization.can(SystemPermission.BRANCHES_UPDATE),
	canDelete: () => Authorization.can(SystemPermission.BRANCHES_DELETE),
	canAssignStudents: () => Authorization.can(SystemPermission.BRANCHES_ASSIGN_STUDENTS)
};

export const Roles = {
	canCreate: () => Authorization.can(SystemPermission.ROLES_CREATE),
	canRead: () => Authorization.can(SystemPermission.ROLES_READ),
	canUpdate: () => Authorization.can(SystemPermission.ROLES_UPDATE),
	canDelete: () => Authorization.can(SystemPermission.ROLES_DELETE),
	canAssign: () => Authorization.can(SystemPermission.ROLES_ASSIGN),
	canManage: () => Authorization.can(SystemPermission.ROLES_MANAGE)
};

export const Reports = {
	canView: () => Authorization.can(SystemPermission.REPORTS_VIEW),
	canExport: () => Authorization.can(SystemPermission.REPORTS_EXPORT)
};

export const Settings = {
	canRead: () => Authorization.can(SystemPermission.SETTINGS_READ),
	canUpdate: () => Authorization.can(SystemPermission.SETTINGS_UPDATE),
	canManage: () => Authorization.can(SystemPermission.SETTINGS_MANAGE)
};

/**
 * Re-export for convenience
 */
export { SystemPermission, type SystemPermissionType, type PermissionString };
