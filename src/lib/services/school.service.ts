import { HttpService } from './http.service';
import type {
	School,
	CreateSchoolDto,
	PaginatedSchoolsResponse,
	SchoolQueryParams,
	SchoolFullInfo,
	PaginatedUsersResponse,
	UserQueryParams
} from '$lib/types/school';

class SchoolService extends HttpService {
	async getAllSchools(params?: SchoolQueryParams): Promise<PaginatedSchoolsResponse> {
		const queryParams = new URLSearchParams();
		if (params?.name) queryParams.append('name', params.name);
		if (params?.address) queryParams.append('address', params.address);
		if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
		if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());

		const url = queryParams.toString() ? `/api/schools?${queryParams.toString()}` : '/api/schools';
		return this.request<PaginatedSchoolsResponse>(url, true);
	}

	async getSchool(id: string): Promise<School> {
		return this.request<School>(`/api/schools/${id}`);
	}

	async createSchool(data: CreateSchoolDto): Promise<School> {
		return this.request<School>('/api/schools', true, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async deleteSchool(id: string): Promise<void> {
		return this.request<void>(`/api/schools/${id}`, true, {
			method: 'DELETE'
		});
	}

	async getSchoolFullInfo(id: string): Promise<SchoolFullInfo> {
		return this.request<SchoolFullInfo>(`/api/schools/${id}/full-info`, true);
	}

	async getSchoolStudents(id: string, params?: UserQueryParams): Promise<PaginatedUsersResponse> {
		const queryParams = new URLSearchParams();
		if (params?.first_name) queryParams.append('first_name', params.first_name);
		if (params?.last_name) queryParams.append('last_name', params.last_name);
		if (params?.email) queryParams.append('email', params.email);
		if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
		if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());

		const url = queryParams.toString()
			? `/api/schools/${id}/students?${queryParams.toString()}`
			: `/api/schools/${id}/students`;
		return this.request<PaginatedUsersResponse>(url, true);
	}

	async getSchoolAdmins(id: string, params?: UserQueryParams): Promise<PaginatedUsersResponse> {
		const queryParams = new URLSearchParams();
		if (params?.first_name) queryParams.append('first_name', params.first_name);
		if (params?.last_name) queryParams.append('last_name', params.last_name);
		if (params?.email) queryParams.append('email', params.email);
		if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
		if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());

		const url = queryParams.toString()
			? `/api/schools/${id}/admins?${queryParams.toString()}`
			: `/api/schools/${id}/admins`;
		return this.request<PaginatedUsersResponse>(url, true);
	}
}

export const schoolService = new SchoolService();
