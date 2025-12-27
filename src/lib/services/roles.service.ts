import { HttpService } from './http.service';
import type {
	Permission,
	CustomRoleWithPermissions,
	PermissionQueryParams,
	RoleQueryParams,
	CreateRoleDto,
	UpdateRoleDto,
	AssignPermissionsDto,
	AssignRoleDto,
	AssignRoleResponse,
	PaginatedPermissionsResponse,
	PaginatedRolesResponse
} from '$lib/types/roles';

class RolesService extends HttpService {
	// Permissions

	async getPermissions(params?: PermissionQueryParams): Promise<PaginatedPermissionsResponse> {
		const queryParams = new URLSearchParams();
		if (params?.category) queryParams.append('category', params.category);
		if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
		if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
		if (params?.page !== undefined) queryParams.append('page', params.page.toString());

		const url = queryParams.toString()
			? `/api/roles/permissions?${queryParams.toString()}`
			: '/api/roles/permissions';
		return this.request<PaginatedPermissionsResponse>(url, true);
	}

	async getPermission(id: string): Promise<Permission> {
		return this.request<Permission>(`/api/roles/permissions/${id}`, true);
	}

	// Roles

	async getRoles(params?: RoleQueryParams): Promise<PaginatedRolesResponse> {
		const queryParams = new URLSearchParams();
		if (params?.school_id) queryParams.append('school_id', params.school_id);
		if (params?.is_system_role !== undefined)
			queryParams.append('is_system_role', params.is_system_role.toString());
		if (params?.name) queryParams.append('name', params.name);
		if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
		if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
		if (params?.page !== undefined) queryParams.append('page', params.page.toString());

		const url = queryParams.toString() ? `/api/roles?${queryParams.toString()}` : '/api/roles';
		return this.request<PaginatedRolesResponse>(url, true);
	}

	async getRole(id: string): Promise<CustomRoleWithPermissions> {
		return this.request<CustomRoleWithPermissions>(`/api/roles/${id}`, true);
	}

	async createRole(data: CreateRoleDto): Promise<CustomRoleWithPermissions> {
		return this.request<CustomRoleWithPermissions>('/api/roles', true, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async updateRole(id: string, data: UpdateRoleDto): Promise<CustomRoleWithPermissions> {
		return this.request<CustomRoleWithPermissions>(`/api/roles/${id}`, true, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
	}

	async deleteRole(id: string): Promise<void> {
		return this.request<void>(`/api/roles/${id}`, true, {
			method: 'DELETE'
		});
	}

	// Role Permission Management

	async assignPermissionsToRole(
		roleId: string,
		data: AssignPermissionsDto
	): Promise<CustomRoleWithPermissions> {
		return this.request<CustomRoleWithPermissions>(`/api/roles/${roleId}/permissions`, true, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async removePermissionFromRole(
		roleId: string,
		permissionId: string
	): Promise<CustomRoleWithPermissions> {
		return this.request<CustomRoleWithPermissions>(
			`/api/roles/${roleId}/permissions/${permissionId}`,
			true,
			{
				method: 'DELETE'
			}
		);
	}

	// User Role Assignment

	async getUserRoles(userId: string): Promise<CustomRoleWithPermissions[]> {
		return this.request<CustomRoleWithPermissions[]>(`/api/users/${userId}/roles`, true);
	}

	async assignRoleToUser(userId: string, data: AssignRoleDto): Promise<AssignRoleResponse> {
		return this.request<AssignRoleResponse>(`/api/users/${userId}/roles`, true, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
		return this.request<void>(`/api/users/${userId}/roles/${roleId}`, true, {
			method: 'DELETE'
		});
	}

	async getUserPermissions(userId: string): Promise<Permission[]> {
		return this.request<Permission[]>(`/api/users/${userId}/permissions`, true);
	}
}

export const rolesService = new RolesService();
