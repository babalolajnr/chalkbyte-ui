import type { Action, ActionReturn } from 'svelte/action';
import { get } from 'svelte/store';
import { permissionsStore } from '$lib/stores/permissions.store';
import { authStore } from '$lib/stores/auth.store';
import type { SystemPermissionType } from '$lib/types/permissions';

export interface AuthorizeOptions {
	/** Single permission or array of permissions to check */
	permission?: SystemPermissionType | SystemPermissionType[] | string | string[];
	/** Single role or array of roles to check */
	role?: string | string[];
	/** If true, user must have ALL permissions/roles. If false, user needs ANY one */
	requireAll?: boolean;
	/** Whether to hide (display: none) or disable the element when unauthorized */
	mode?: 'hide' | 'disable' | 'remove';
	/** Custom class to add when unauthorized (only for 'disable' mode) */
	disabledClass?: string;
}

function checkPermissions(
	permissions: string[],
	requireAll: boolean,
	userPermissions: string[]
): boolean {
	if (permissions.length === 0) return true;

	if (requireAll) {
		return permissions.every((p) => userPermissions.includes(p));
	} else {
		return permissions.some((p) => userPermissions.includes(p));
	}
}

function checkRoles(roles: string[], requireAll: boolean, userRoles: string[]): boolean {
	if (roles.length === 0) return true;

	if (requireAll) {
		return roles.every((r) => userRoles.includes(r));
	} else {
		return roles.some((r) => userRoles.includes(r));
	}
}

function checkAuthorization(options: AuthorizeOptions): boolean {
	const state = get(permissionsStore);
	const auth = get(authStore);

	// Must be authenticated
	if (!auth.isAuthenticated) {
		return false;
	}

	const requireAll = options.requireAll ?? true;
	const userPermissionNames = state.permissions.map((p) => p.name);
	const userRoleNames = state.roles.map((r) => r.name);

	// Check permissions
	const permissions = options.permission
		? Array.isArray(options.permission)
			? options.permission
			: [options.permission]
		: [];

	if (!checkPermissions(permissions, requireAll, userPermissionNames)) {
		return false;
	}

	// Check roles
	const roles = options.role ? (Array.isArray(options.role) ? options.role : [options.role]) : [];

	if (!checkRoles(roles, requireAll, userRoleNames)) {
		return false;
	}

	return true;
}

/**
 * Svelte action that controls element visibility based on permissions/roles
 *
 * @example
 * <button use:authorize={{ permission: 'users:create' }}>Create User</button>
 * <button use:authorize={{ permission: ['users:update', 'users:delete'], requireAll: false }}>Edit/Delete</button>
 * <button use:authorize={{ role: 'admin', mode: 'disable' }}>Admin Action</button>
 */
export const authorize: Action<HTMLElement, AuthorizeOptions> = (node, options) => {
	let currentOptions = options;
	let originalDisplay: string | null = null;
	let isRemoved = false;
	let placeholder: Comment | null = null;
	let unsubscribe: (() => void) | null = null;

	function applyAuthorization() {
		const isAuthorized = checkAuthorization(currentOptions);
		const mode = currentOptions.mode ?? 'hide';

		if (isAuthorized) {
			// Restore element
			if (mode === 'hide' && originalDisplay !== null) {
				node.style.display = originalDisplay;
			} else if (mode === 'disable') {
				if (node instanceof HTMLButtonElement || node instanceof HTMLInputElement) {
					node.disabled = false;
				}
				node.removeAttribute('aria-disabled');
				if (currentOptions.disabledClass) {
					node.classList.remove(currentOptions.disabledClass);
				}
			} else if (mode === 'remove' && isRemoved && placeholder) {
				placeholder.parentNode?.replaceChild(node, placeholder);
				isRemoved = false;
			}
		} else {
			// Hide/disable/remove element
			if (mode === 'hide') {
				if (originalDisplay === null) {
					originalDisplay = node.style.display;
				}
				node.style.display = 'none';
			} else if (mode === 'disable') {
				if (node instanceof HTMLButtonElement || node instanceof HTMLInputElement) {
					node.disabled = true;
				}
				node.setAttribute('aria-disabled', 'true');
				if (currentOptions.disabledClass) {
					node.classList.add(currentOptions.disabledClass);
				}
			} else if (mode === 'remove' && !isRemoved) {
				placeholder = document.createComment('authorize-placeholder');
				node.parentNode?.replaceChild(placeholder, node);
				isRemoved = true;
			}
		}
	}

	// Initial application
	applyAuthorization();

	// Subscribe to store changes
	unsubscribe = permissionsStore.subscribe(() => {
		applyAuthorization();
	});

	return {
		update(newOptions) {
			currentOptions = newOptions;
			applyAuthorization();
		},
		destroy() {
			if (unsubscribe) {
				unsubscribe();
			}
			// Restore element if removed
			if (isRemoved && placeholder) {
				placeholder.parentNode?.replaceChild(node, placeholder);
			}
		}
	};
};

type PermissionParam = SystemPermissionType | SystemPermissionType[] | string | string[];
type RoleParam = string | string[];

/**
 * Shorthand action for permission-only checks
 *
 * @example
 * <button use:requirePermission={'users:create'}>Create User</button>
 * <button use:requirePermission={['users:update', 'users:delete']}>Edit</button>
 */
export function requirePermission(
	node: HTMLElement,
	permission: PermissionParam
): ActionReturn<PermissionParam> {
	const result = authorize(node, { permission });
	return {
		update(newPermission: PermissionParam) {
			result?.update?.({ permission: newPermission });
		},
		destroy() {
			result?.destroy?.();
		}
	};
}

/**
 * Shorthand action for role-only checks
 *
 * @example
 * <button use:requireRole={'admin'}>Admin Only</button>
 * <button use:requireRole={['admin', 'moderator']}>Staff Only</button>
 */
export function requireRole(node: HTMLElement, role: RoleParam): ActionReturn<RoleParam> {
	const result = authorize(node, { role, requireAll: false });
	return {
		update(newRole: RoleParam) {
			result?.update?.({ role: newRole, requireAll: false });
		},
		destroy() {
			result?.destroy?.();
		}
	};
}

/**
 * Action that disables element based on permissions
 *
 * @example
 * <button use:disableWithoutPermission={'users:delete'}>Delete</button>
 */
export function disableWithoutPermission(
	node: HTMLElement,
	permission: PermissionParam
): ActionReturn<PermissionParam> {
	const result = authorize(node, { permission, mode: 'disable' });
	return {
		update(newPermission: PermissionParam) {
			result?.update?.({ permission: newPermission, mode: 'disable' });
		},
		destroy() {
			result?.destroy?.();
		}
	};
}

/**
 * Action that removes element from DOM based on permissions
 *
 * @example
 * <button use:removeWithoutPermission={'users:delete'}>Delete</button>
 */
export function removeWithoutPermission(
	node: HTMLElement,
	permission: PermissionParam
): ActionReturn<PermissionParam> {
	const result = authorize(node, { permission, mode: 'remove' });
	return {
		update(newPermission: PermissionParam) {
			result?.update?.({ permission: newPermission, mode: 'remove' });
		},
		destroy() {
			result?.destroy?.();
		}
	};
}
