import { writable, derived, get } from 'svelte/store';
import type { Permission, CustomRoleWithPermissions } from '$lib/types/roles';
import { rolesService } from '$lib/services/roles.service';

interface PermissionsState {
	permissions: Permission[];
	roles: CustomRoleWithPermissions[];
	isLoading: boolean;
	error: string | null;
}

const initialState: PermissionsState = {
	permissions: [],
	roles: [],
	isLoading: false,
	error: null
};

function createPermissionsStore() {
	const { subscribe, set, update } = writable<PermissionsState>(initialState);

	return {
		subscribe,

		async loadUserPermissions(userId: string) {
			update((state) => ({ ...state, isLoading: true, error: null }));
			try {
				const permissions = await rolesService.getUserPermissions(userId);
				update((state) => ({ ...state, permissions, isLoading: false }));
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to load permissions';
				update((state) => ({ ...state, error: message, isLoading: false }));
			}
		},

		async loadUserRoles(userId: string) {
			update((state) => ({ ...state, isLoading: true, error: null }));
			try {
				const roles = await rolesService.getUserRoles(userId);
				update((state) => ({ ...state, roles, isLoading: false }));
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to load roles';
				update((state) => ({ ...state, error: message, isLoading: false }));
			}
		},

		async loadUserPermissionsAndRoles(userId: string) {
			update((state) => ({ ...state, isLoading: true, error: null }));
			try {
				const [permissions, roles] = await Promise.all([
					rolesService.getUserPermissions(userId),
					rolesService.getUserRoles(userId)
				]);
				update((state) => ({ ...state, permissions, roles, isLoading: false }));
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to load permissions and roles';
				update((state) => ({ ...state, error: message, isLoading: false }));
			}
		},

		setPermissions(permissions: Permission[]) {
			update((state) => ({ ...state, permissions }));
		},

		setRoles(roles: CustomRoleWithPermissions[]) {
			update((state) => ({ ...state, roles }));
		},

		clearError() {
			update((state) => ({ ...state, error: null }));
		},

		reset() {
			set(initialState);
		}
	};
}

export const permissionsStore = createPermissionsStore();

// Derived stores
export const userPermissions = derived(permissionsStore, ($store) => $store.permissions);
export const userRoles = derived(permissionsStore, ($store) => $store.roles);
export const permissionsLoading = derived(permissionsStore, ($store) => $store.isLoading);
export const permissionsError = derived(permissionsStore, ($store) => $store.error);

// Utility functions for permission checks
export function hasPermission(permissionName: string): boolean {
	const state = get(permissionsStore);
	return state.permissions.some((p) => p.name === permissionName);
}

export function hasAnyPermission(permissionNames: string[]): boolean {
	const state = get(permissionsStore);
	return permissionNames.some((name) => state.permissions.some((p) => p.name === name));
}

export function hasAllPermissions(permissionNames: string[]): boolean {
	const state = get(permissionsStore);
	return permissionNames.every((name) => state.permissions.some((p) => p.name === name));
}

export function hasRole(roleName: string): boolean {
	const state = get(permissionsStore);
	return state.roles.some((r) => r.name === roleName);
}

export function hasAnyRole(roleNames: string[]): boolean {
	const state = get(permissionsStore);
	return roleNames.some((name) => state.roles.some((r) => r.name === name));
}

export function getPermissionsByCategory(category: string): Permission[] {
	const state = get(permissionsStore);
	return state.permissions.filter((p) => p.category === category);
}

// Reactive derived stores for permission checks
export function createPermissionCheck(permissionName: string) {
	return derived(permissionsStore, ($store) => $store.permissions.some((p) => p.name === permissionName));
}

export function createAnyPermissionCheck(permissionNames: string[]) {
	return derived(permissionsStore, ($store) =>
		permissionNames.some((name) => $store.permissions.some((p) => p.name === name))
	);
}

export function createAllPermissionsCheck(permissionNames: string[]) {
	return derived(permissionsStore, ($store) =>
		permissionNames.every((name) => $store.permissions.some((p) => p.name === name))
	);
}

export function createRoleCheck(roleName: string) {
	return derived(permissionsStore, ($store) => $store.roles.some((r) => r.name === roleName));
}
