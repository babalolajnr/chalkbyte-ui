import { HttpService } from './http.service';
import type {
	LoginRequest,
	LoginResponse,
	MFAVerifyRequest,
	MFAVerifyResponse,
	RecoveryCodeRequest,
	RecoveryCodeResponse,
	PasswordResetRequest,
	PasswordResetResponse,
	PasswordResetConfirmRequest,
	PasswordResetConfirmResponse,
	MFAEnableResponse,
	MFAVerifySetupRequest,
	MFAVerifySetupResponse,
	MFADisableRequest,
	MFADisableResponse,
	MFAStatusResponse,
	MFARegenerateCodesResponse
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
		const response = await this.request<LoginResponse>('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify(data)
		});

		if (response.access_token) {
			this.setAccessToken(response.access_token);
		}

		return response;
	}

	async verifyMFA(data: MFAVerifyRequest): Promise<MFAVerifyResponse> {
		const response = await this.request<MFAVerifyResponse>('/api/auth/mfa/verify', {
			method: 'POST',
			body: JSON.stringify(data)
		});

		if (response.access_token) {
			this.setAccessToken(response.access_token);
		}

		return response;
	}

	async loginWithRecoveryCode(data: RecoveryCodeRequest): Promise<RecoveryCodeResponse> {
		const response = await this.request<RecoveryCodeResponse>('/api/auth/recovery', {
			method: 'POST',
			body: JSON.stringify(data)
		});

		if (response.access_token) {
			this.setAccessToken(response.access_token);
		}

		return response;
	}

	async requestPasswordReset(data: PasswordResetRequest): Promise<PasswordResetResponse> {
		return this.request<PasswordResetResponse>('/api/auth/forgot-password', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async resetPassword(data: PasswordResetConfirmRequest): Promise<PasswordResetConfirmResponse> {
		return this.request<PasswordResetConfirmResponse>('/api/auth/reset-password', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async enableMFA(): Promise<MFAEnableResponse> {
		return this.request<MFAEnableResponse>('/api/auth/mfa/enable', {
			method: 'POST'
		});
	}

	async verifyMFASetup(data: MFAVerifySetupRequest): Promise<MFAVerifySetupResponse> {
		return this.request<MFAVerifySetupResponse>('/api/auth/mfa/verify-setup', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async disableMFA(data: MFADisableRequest): Promise<MFADisableResponse> {
		return this.request<MFADisableResponse>('/api/auth/mfa/disable', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async getMFAStatus(): Promise<MFAStatusResponse> {
		return this.request<MFAStatusResponse>('/api/auth/mfa/status', {
			method: 'GET'
		});
	}

	async regenerateRecoveryCodes(): Promise<MFARegenerateCodesResponse> {
		return this.request<MFARegenerateCodesResponse>('/api/auth/mfa/recovery-codes', {
			method: 'POST'
		});
	}

	logout(): void {
		this.removeAccessToken();
	}
}

export const authService = new AuthService();
