import { HttpService } from './http.service';
import type {
	LoginRequest,
	LoginResponse,
	PasswordResetRequest,
	PasswordResetResponse,
	PasswordResetConfirmRequest,
	PasswordResetConfirmResponse,
	RefreshTokenRequest,
	RefreshTokenResponse,
	LogoutResponse
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

	private setRefreshToken(token: string): void {
		if (typeof window === 'undefined') return;
		localStorage.setItem('refresh_token', token);
	}

	private getRefreshToken(): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('refresh_token');
	}

	private removeRefreshToken(): void {
		if (typeof window === 'undefined') return;
		localStorage.removeItem('refresh_token');
	}

	async login(data: LoginRequest): Promise<LoginResponse> {
		const response = await this.request<LoginResponse>('/api/auth/login', false, {
			method: 'POST',
			body: JSON.stringify(data)
		});

		if (response.access_token) {
			this.setAccessToken(response.access_token);
		}

		if (response.refresh_token) {
			this.setRefreshToken(response.refresh_token);
		}

		return response;
	}

	async refreshToken(): Promise<RefreshTokenResponse> {
		const refreshToken = this.getRefreshToken();

		if (!refreshToken) {
			throw new Error('No refresh token available');
		}

		const response = await this.request<RefreshTokenResponse>('/api/auth/refresh', false, {
			method: 'POST',
			body: JSON.stringify({ refresh_token: refreshToken } as RefreshTokenRequest)
		});

		if (response.access_token) {
			this.setAccessToken(response.access_token);
		}

		if (response.refresh_token) {
			this.setRefreshToken(response.refresh_token);
		}

		return response;
	}

	async logout(): Promise<LogoutResponse> {
		const response = await this.request<LogoutResponse>('/api/auth/logout', true, {
			method: 'POST'
		});

		this.removeAccessToken();
		this.removeRefreshToken();

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

	clearTokens(): void {
		this.removeAccessToken();
		this.removeRefreshToken();
	}
}

export const authService = new AuthService();
