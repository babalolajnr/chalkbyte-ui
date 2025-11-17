import { createMutation, createQuery } from '@tanstack/svelte-query';
import { authService } from '$lib/services/auth.service';
import { authStore } from '$lib/stores/auth.store';
import { goto } from '$app/navigation';
import type {
	LoginRequest,
	MFAVerifyRequest,
	RecoveryCodeRequest,
	PasswordResetRequest,
	PasswordResetConfirmRequest,
	MFAVerifySetupRequest,
	MFADisableRequest
} from '$lib/types/auth';

// Query keys
export const authKeys = {
	all: ['auth'] as const,
	mfaStatus: () => [...authKeys.all, 'mfa-status'] as const
};

// Queries
export function useMFAStatus() {
	return createQuery(() => ({
		queryKey: authKeys.mfaStatus(),
		queryFn: () => authService.getMFAStatus(),
		enabled: !!authService.getAccessToken()
	}));
}

// Mutations
export function useLogin() {
	return createMutation(() => ({
		mutationFn: (data: LoginRequest) => authService.login(data),
		onSuccess: (response) => {
			if (response.mfa_required && response.temp_token) {
				authStore.setMFARequired(response.temp_token);
				goto('/otp');
			} else if (response.access_token && response.user) {
				authStore.setUser(response.user, response.access_token);
				goto('/dashboard');
			}
		}
	}));
}

export function useVerifyMFA() {
	return createMutation(() => ({
		mutationFn: (data: MFAVerifyRequest) => authService.verifyMFA(data),
		onSuccess: (response) => {
			if (response.access_token && response.user) {
				authStore.setUser(response.user, response.access_token);
				authStore.clearMFARequired();
				goto('/dashboard');
			}
		}
	}));
}

export function useLoginWithRecoveryCode() {
	return createMutation(() => ({
		mutationFn: (data: RecoveryCodeRequest) => authService.loginWithRecoveryCode(data),
		onSuccess: (response) => {
			if (response.access_token && response.user) {
				authStore.setUser(response.user, response.access_token);
				authStore.clearMFARequired();
				goto('/dashboard');
			}
		}
	}));
}

export function useRequestPasswordReset() {
	return createMutation(() => ({
		mutationFn: (data: PasswordResetRequest) => authService.requestPasswordReset(data)
	}));
}

export function useResetPassword() {
	return createMutation(() => ({
		mutationFn: (data: PasswordResetConfirmRequest) => authService.resetPassword(data),
		onSuccess: () => {
			goto('/login');
		}
	}));
}

export function useEnableMFA() {
	return createMutation(() => ({
		mutationFn: () => authService.enableMFA()
	}));
}

export function useVerifyMFASetup() {
	return createMutation(() => ({
		mutationFn: (data: MFAVerifySetupRequest) => authService.verifyMFASetup(data)
	}));
}

export function useDisableMFA() {
	return createMutation(() => ({
		mutationFn: (data: MFADisableRequest) => authService.disableMFA(data)
	}));
}

export function useRegenerateRecoveryCodes() {
	return createMutation(() => ({
		mutationFn: () => authService.regenerateRecoveryCodes()
	}));
}
