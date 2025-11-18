import { HttpService } from './http.service';
import type {
	LoginRequest,
	LoginResponse,
	PasswordResetRequest,
	PasswordResetResponse,
	PasswordResetConfirmRequest,
	PasswordResetConfirmResponse
} from '$lib/types/auth';

class AuthService extends HttpService {
	protected getAuthToken(): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('access_token');
	}

	public isAuthenticated(): boolean {
		return !!this.getAuthToken();
	}

	private setAccessToken(token: string): void {
		if (typeof window === 'undefined') return;
		localStorage.setItem('access_token', token);
	}

	private removeAccessToken(): void {
		if (typeof window === 'undefined') return;
		localStorage.removeItem('access_token');
	}

	async login(data: LoginRequest): Promise<LoginResponse> {
		const response = await this.request<LoginResponse>('/api/auth/login', false, {
			method: 'POST',
			body: JSON.stringify(data)
		});

		if (response.access_token) {
			this.setAccessToken(response.access_token);
		}

		return response;
	}

	async requestPasswordReset(data: PasswordResetRequest): Promise<PasswordResetResponse> {
		return this.request<PasswordResetResponse>('/api/auth/forgot-password', false, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async resetPassword(data: PasswordResetConfirmRequest): Promise<PasswordResetConfirmResponse> {
		return this.request<PasswordResetConfirmResponse>('/api/auth/reset-password', false, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	logout(): void {
		this.removeAccessToken();
	}
}

export const authService = new AuthService();
