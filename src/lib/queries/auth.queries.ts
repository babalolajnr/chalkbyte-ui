import { createMutation, createQuery } from '@tanstack/svelte-query';
import { authService } from '$lib/services/auth.service';
import { mfaService } from '$lib/services/mfa.service';
import { authStore } from '$lib/stores/auth.store';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
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
		queryFn: () => mfaService.getMFAStatus(),
		enabled: authService.isAuthenticated()
	}));
}

// Mutations
export function useLogin() {
	return createMutation(() => ({
		mutationFn: (data: LoginRequest) => authService.login(data),
		onSuccess: async (response) => {
			if (response.mfa_required && response.temp_token) {
				authStore.setMFARequired(response.temp_token);
				await goto(resolve('/otp'));
			} else if (response.access_token && response.user) {
				authStore.setUser(response.user, response.access_token, response.refresh_token);
				await goto(resolve('/dashboard'));
			}
		}
	}));
}

export function useVerifyMFA() {
	return createMutation(() => ({
		mutationFn: (data: MFAVerifyRequest) => mfaService.verifyMFA(data),
		onSuccess: async (response) => {
			if (response.access_token && response.user) {
				authStore.setUser(response.user, response.access_token, response.refresh_token);
				authStore.clearMFARequired();
				await goto(resolve('/dashboard'));
			}
		}
	}));
}

export function useLoginWithRecoveryCode() {
	return createMutation(() => ({
		mutationFn: (data: RecoveryCodeRequest) => mfaService.loginWithRecoveryCode(data),
		onSuccess: async (response) => {
			if (response.access_token && response.user) {
				authStore.setUser(response.user, response.access_token, response.refresh_token);
				authStore.clearMFARequired();
				await goto(resolve('/dashboard'));
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
		onSuccess: async () => {
			await goto(resolve('/login'));
		}
	}));
}

export function useEnableMFA() {
	return createMutation(() => ({
		mutationFn: () => mfaService.enableMFA()
	}));
}

export function useVerifyMFASetup() {
	return createMutation(() => ({
		mutationFn: (data: MFAVerifySetupRequest) => mfaService.verifyMFASetup(data)
	}));
}

export function useDisableMFA() {
	return createMutation(() => ({
		mutationFn: (data: MFADisableRequest) => mfaService.disableMFA(data)
	}));
}

export function useRegenerateRecoveryCodes() {
	return createMutation(() => ({
		mutationFn: () => mfaService.regenerateRecoveryCodes()
	}));
}

export function useLogout() {
	return createMutation(() => ({
		mutationFn: () => authService.logout(),
		onSuccess: async () => {
			authStore.logout();
			await goto(resolve('/login'));
		},
		onError: () => {
			authStore.logout();
			goto(resolve('/login'));
		}
	}));
}

export function useRefreshToken() {
	return createMutation(() => ({
		mutationFn: () => authService.refreshToken(),
		onSuccess: (response) => {
			authStore.setUser(response.user, response.access_token, response.refresh_token);
		},
		onError: () => {
			authStore.logout();
			goto(resolve('/login'));
		}
	}));
}
