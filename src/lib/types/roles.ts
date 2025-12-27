import type { PaginatedResponse } from './api';

export interface Permission {
	id: string;
	name: string;
	description: string | null;
	category: string;
	created_at: string;
	updated_at: string;
}

export interface CustomRole {
	id: string;
	name: string;
	description: string | null;
	school_id: string | null;
	is_system_role: boolean;
	created_at: string;
	updated_at: string;
}

export interface CustomRoleWithPermissions extends CustomRole {
	permissions: Permission[];
}

export interface PermissionQueryParams {
	category?: string;
	limit?: number;
	offset?: number;
	page?: number;
}

export interface RoleQueryParams {
	school_id?: string;
	is_system_role?: boolean;
	name?: string;
	limit?: number;
	offset?: number;
	page?: number;
}

export interface CreateRoleDto {
	name: string;
	description?: string;
	school_id?: string;
	permission_ids?: string[];
}

export interface UpdateRoleDto {
	name?: string;
	description?: string;
}

export interface AssignPermissionsDto {
	permission_ids: string[];
}

export interface AssignRoleDto {
	role_id: string;
}

export interface AssignRoleResponse {
	message: string;
	user_id: string;
	role_id: string;
}

export type PaginatedPermissionsResponse = PaginatedResponse<Permission>;

export type PaginatedRolesResponse = PaginatedResponse<CustomRoleWithPermissions>;
