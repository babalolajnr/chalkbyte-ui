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
	MFARegenerateCodesResponse,
	ErrorResponse
} from '$lib/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.chalkbyte.com';

class AuthService {
	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const token = this.getAccessToken();
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...(options.headers as Record<string, string>)
		};

		if (token && !endpoint.includes('/login')) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			headers
		});

		if (!response.ok) {
			let errorMessage = 'An error occurred';
			try {
				const contentType = response.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					const error: ErrorResponse = await response.json();
					errorMessage = error.error || errorMessage;
				} else {
					errorMessage = `${response.status} ${response.statusText}`;
				}
			} catch {
				errorMessage = `${response.status} ${response.statusText}`;
			}
			throw new Error(errorMessage);
		}

		return response.json();
	}

	getAccessToken(): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('access_token');
	}

	setAccessToken(token: string): void {
		if (typeof window === 'undefined') return;
		localStorage.setItem('access_token', token);
	}

	removeAccessToken(): void {
		if (typeof window === 'undefined') return;
		localStorage.removeItem('access_token');
	}

	async login(data: LoginRequest): Promise<LoginResponse> {
		return this.request<LoginResponse>('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async verifyMFA(data: MFAVerifyRequest): Promise<MFAVerifyResponse> {
		return this.request<MFAVerifyResponse>('/api/auth/mfa/verify', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async loginWithRecoveryCode(data: RecoveryCodeRequest): Promise<RecoveryCodeResponse> {
		return this.request<RecoveryCodeResponse>('/api/auth/recovery', {
			method: 'POST',
			body: JSON.stringify(data)
		});
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
