// place files you want to import through the `$lib` alias in this folder.

// Authentication exports
export { authService } from './services/auth.service';
export {
	authStore,
	isAuthenticated,
	currentUser,
	// isLoading,
	mfaRequired
} from './stores/auth.store';
export { requireAuth, requireGuest, requireRole } from './guards/auth.guard';
export * from './types/auth';
export * from './auth-utils';
export * from './queries/auth.queries';

// Roles and Permissions exports
export { rolesService } from './services/roles.service';
export {
	permissionsStore,
	userPermissions,
	userRoles,
	permissionsLoading,
	permissionsError,
	hasPermission,
	hasAnyPermission,
	hasAllPermissions,
	hasRole,
	hasAnyRole,
	getPermissionsByCategory,
	createPermissionCheck,
	createAnyPermissionCheck,
	createAllPermissionsCheck,
	createRoleCheck
} from './stores/permissions.store';
export { useRoles, UseRoles } from './hooks/use-roles.svelte';
export { usePermissions, UsePermissions } from './hooks/use-permissions.svelte';
export * from './types/roles';
export * from './queries/roles.queries';

// Permission Guards exports
export {
	canAccessRoute,
	canAccessFeature,
	requirePermission,
	requireAnyPermission,
	requireRoleGuard,
	guardRoute,
	guardFeature
} from './guards/permission.guard';
export * from './types/permissions';

// Access Control Components
export { PermissionGuard, RoleGuard, FeatureGuard } from './components/access-control';

// Permission Checking Hooks
export {
	usePermissions as usePermissionChecks,
	createPermissionCheck as createPermissionCheckStore,
	createAnyPermissionCheck as createAnyPermissionCheckStore,
	createAllPermissionsCheck as createAllPermissionsCheckStore,
	createRoleCheck as createRoleCheckStore,
	createFeatureCheck,
	createRouteCheck
} from './hooks/use-permission-checks.svelte';
