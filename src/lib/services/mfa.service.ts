import { HttpService } from './http.service';
import type {
	MFAVerifyRequest,
	MFAVerifyResponse,
	RecoveryCodeRequest,
	RecoveryCodeResponse,
	MFAEnableResponse,
	MFAVerifySetupRequest,
	MFAVerifySetupResponse,
	MFADisableRequest,
	MFADisableResponse,
	MFAStatusResponse,
	MFARegenerateCodesResponse
} from '$lib/types/auth';

class MFAService extends HttpService {
	protected getAuthToken(): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('access_token');
	}

	private setAccessToken(token: string): void {
		if (typeof window === 'undefined') return;
		localStorage.setItem('access_token', token);
	}

	private setRefreshToken(token: string): void {
		if (typeof window === 'undefined') return;
		localStorage.setItem('refresh_token', token);
	}

	async verifyMFA(data: MFAVerifyRequest): Promise<MFAVerifyResponse> {
		const response = await this.request<MFAVerifyResponse>('/api/auth/mfa/verify', false, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${data.temp_token}`
			},
			body: JSON.stringify({ code: data.code, temp_token: data.temp_token })
		});

		if (response.access_token) {
			this.setAccessToken(response.access_token);
		}

		if (response.refresh_token) {
			this.setRefreshToken(response.refresh_token);
		}

		return response;
	}

	async loginWithRecoveryCode(data: RecoveryCodeRequest): Promise<RecoveryCodeResponse> {
		const response = await this.request<RecoveryCodeResponse>('/api/recovery', false, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${data.temp_token}`
			},
			body: JSON.stringify({ recovery_code: data.recovery_code, temp_token: data.temp_token })
		});

		if (response.access_token) {
			this.setAccessToken(response.access_token);
		}

		if (response.refresh_token) {
			this.setRefreshToken(response.refresh_token);
		}

		return response;
	}

	async enableMFA(): Promise<MFAEnableResponse> {
		return this.request<MFAEnableResponse>('/api/mfa/enable', true, {
			method: 'POST'
		});
	}

	async verifyMFASetup(data: MFAVerifySetupRequest): Promise<MFAVerifySetupResponse> {
		return this.request<MFAVerifySetupResponse>('/api/mfa/verify', true, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async disableMFA(data: MFADisableRequest): Promise<MFADisableResponse> {
		return this.request<MFADisableResponse>('/api/mfa/disable', true, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async getMFAStatus(): Promise<MFAStatusResponse> {
		return this.request<MFAStatusResponse>('/api/mfa/status', true, {
			method: 'GET'
		});
	}

	async regenerateRecoveryCodes(): Promise<MFARegenerateCodesResponse> {
		return this.request<MFARegenerateCodesResponse>('/api/mfa/recovery-codes/regenerate', true, {
			method: 'POST'
		});
	}
}

export const mfaService = new MFAService();
