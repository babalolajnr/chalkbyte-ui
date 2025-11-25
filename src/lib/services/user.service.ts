import { HttpService } from './http.service';
import type { User } from '$lib/types/auth';

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
}

export const userService = new UserService();
