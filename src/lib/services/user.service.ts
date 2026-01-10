import { HttpService } from './http.service';
import type { User } from '$lib/types/auth';
import type {
	PaginatedUsersResponse,
	UserQueryParams,
	CreateUserDto,
	UpdateUserDto
} from '$lib/types/user';

export interface UserProfile {
	user: User;
	school?: {
		id: string;
		name: string;
		address: string;
	};
}

export interface UpdateUserProfileRequest {
	first_name?: string;
	last_name?: string;
}

export interface ChangePasswordRequest {
	current_password: string;
	new_password: string;
}

class UserService extends HttpService {
	protected getAuthToken(): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('access_token');
	}

	// Profile Management
	async getCurrentUserProfile(): Promise<UserProfile> {
		return this.request<UserProfile>('/api/users/profile', true, {
			method: 'GET'
		});
	}

	async updateUserProfile(data: UpdateUserProfileRequest): Promise<User> {
		return this.request<User>('/api/users/profile', true, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
	}

	async changePassword(data: ChangePasswordRequest): Promise<void> {
		return this.request<void>('/api/users/profile/change-password', true, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	// User Management (Admin)
	async getAllUsers(params?: UserQueryParams): Promise<PaginatedUsersResponse> {
		const queryParams = new URLSearchParams();

		if (params?.first_name) queryParams.append('first_name', params.first_name);
		if (params?.last_name) queryParams.append('last_name', params.last_name);
		if (params?.email) queryParams.append('email', params.email);
		if (params?.role_id) queryParams.append('role_id', params.role_id);
		if (params?.school_id) queryParams.append('school_id', params.school_id);
		if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
		if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());

		const queryString = queryParams.toString();
		const endpoint = queryString ? `/api/users?${queryString}` : '/api/users';

		return this.request<PaginatedUsersResponse>(endpoint, true, {
			method: 'GET'
		});
	}

	async createUser(data: CreateUserDto): Promise<User> {
		return this.request<User>('/api/users', true, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async getUser(id: string): Promise<User> {
		return this.request<User>(`/api/users/${id}`, true, {
			method: 'GET'
		});
	}

	async updateUser(id: string, data: UpdateUserDto): Promise<User> {
		return this.request<User>(`/api/users/${id}`, true, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
	}

	async deleteUser(id: string): Promise<void> {
		return this.request<void>(`/api/users/${id}`, true, {
			method: 'DELETE'
		});
	}
}

export const userService = new UserService();
