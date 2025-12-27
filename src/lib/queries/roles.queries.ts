import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
import { rolesService } from '$lib/services/roles.service';
import type {
	PermissionQueryParams,
	RoleQueryParams,
	CreateRoleDto,
	UpdateRoleDto,
	AssignPermissionsDto,
	AssignRoleDto
} from '$lib/types/roles';

// Query keys
export const roleKeys = {
	all: ['roles'] as const,
	lists: () => [...roleKeys.all, 'list'] as const,
	list: (params?: RoleQueryParams) => [...roleKeys.lists(), params] as const,
	details: () => [...roleKeys.all, 'detail'] as const,
	detail: (id: string) => [...roleKeys.details(), id] as const
};

export const permissionKeys = {
	all: ['permissions'] as const,
	lists: () => [...permissionKeys.all, 'list'] as const,
	list: (params?: PermissionQueryParams) => [...permissionKeys.lists(), params] as const,
	details: () => [...permissionKeys.all, 'detail'] as const,
	detail: (id: string) => [...permissionKeys.details(), id] as const
};

export const userRoleKeys = {
	all: ['user-roles'] as const,
	roles: (userId: string) => [...userRoleKeys.all, userId, 'roles'] as const,
	permissions: (userId: string) => [...userRoleKeys.all, userId, 'permissions'] as const
};

// Permission Queries
export function usePermissions(params?: PermissionQueryParams) {
	return createQuery(() => ({
		queryKey: permissionKeys.list(params),
		queryFn: () => rolesService.getPermissions(params)
	}));
}

export function usePermission(id: string) {
	return createQuery(() => ({
		queryKey: permissionKeys.detail(id),
		queryFn: () => rolesService.getPermission(id),
		enabled: !!id
	}));
}

// Role Queries
export function useRoles(params?: RoleQueryParams) {
	return createQuery(() => ({
		queryKey: roleKeys.list(params),
		queryFn: () => rolesService.getRoles(params)
	}));
}

export function useRole(id: string) {
	return createQuery(() => ({
		queryKey: roleKeys.detail(id),
		queryFn: () => rolesService.getRole(id),
		enabled: !!id
	}));
}

// User Role Queries
export function useUserRoles(userId: string) {
	return createQuery(() => ({
		queryKey: userRoleKeys.roles(userId),
		queryFn: () => rolesService.getUserRoles(userId),
		enabled: !!userId
	}));
}

export function useUserPermissions(userId: string) {
	return createQuery(() => ({
		queryKey: userRoleKeys.permissions(userId),
		queryFn: () => rolesService.getUserPermissions(userId),
		enabled: !!userId
	}));
}

// Role Mutations
export function useCreateRole() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: (data: CreateRoleDto) => rolesService.createRole(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
		}
	}));
}

export function useUpdateRole() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
			rolesService.updateRole(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
			queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) });
		}
	}));
}

export function useDeleteRole() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: (id: string) => rolesService.deleteRole(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
		}
	}));
}

// Role Permission Mutations
export function useAssignPermissionsToRole() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: ({ roleId, data }: { roleId: string; data: AssignPermissionsDto }) =>
			rolesService.assignPermissionsToRole(roleId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.roleId) });
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
		}
	}));
}

export function useRemovePermissionFromRole() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
			rolesService.removePermissionFromRole(roleId, permissionId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.roleId) });
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
		}
	}));
}

// User Role Assignment Mutations
export function useAssignRoleToUser() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: ({ userId, data }: { userId: string; data: AssignRoleDto }) =>
			rolesService.assignRoleToUser(userId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: userRoleKeys.roles(variables.userId) });
			queryClient.invalidateQueries({ queryKey: userRoleKeys.permissions(variables.userId) });
		}
	}));
}

export function useRemoveRoleFromUser() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
			rolesService.removeRoleFromUser(userId, roleId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: userRoleKeys.roles(variables.userId) });
			queryClient.invalidateQueries({ queryKey: userRoleKeys.permissions(variables.userId) });
		}
	}));
}
