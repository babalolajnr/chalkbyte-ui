import { writable, derived } from 'svelte/store';
import type { AuthState, User } from '$lib/types/auth';
import { authService } from '$lib/services/auth.service';

const initialState: AuthState = {
	user: null,
	accessToken: null,
	isAuthenticated: false,
	isLoading: true,
	tempToken: null,
	mfaRequired: false
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,
		setUser: (user: User, accessToken: string) => {
			authService.setAccessToken(accessToken);
			update((state) => ({
				...state,
				user,
				accessToken,
				isAuthenticated: true,
				isLoading: false,
				tempToken: null,
				mfaRequired: false
			}));
		},
		setMFARequired: (tempToken: string) => {
			update((state) => ({
				...state,
				tempToken,
				mfaRequired: true,
				isLoading: false
			}));
		},
		clearMFARequired: () => {
			update((state) => ({
				...state,
				tempToken: null,
				mfaRequired: false
			}));
		},
		setLoading: (isLoading: boolean) => {
			update((state) => ({ ...state, isLoading }));
		},
		logout: () => {
			authService.logout();
			set(initialState);
		},
		initialize: async () => {
			const token = authService.getAccessToken();
			if (token) {
				try {
					const status = await authService.getMFAStatus();
					update((state) => ({
						...state,
						accessToken: token,
						isAuthenticated: true,
						isLoading: false
					}));
				} catch (error) {
					authService.removeAccessToken();
					update((state) => ({ ...state, isLoading: false }));
				}
			} else {
				update((state) => ({ ...state, isLoading: false }));
			}
		},
		reset: () => set(initialState)
	};
}

export const authStore = createAuthStore();

export const isAuthenticated = derived(authStore, ($auth) => $auth.isAuthenticated);
export const currentUser = derived(authStore, ($auth) => $auth.user);
export const isLoading = derived(authStore, ($auth) => $auth.isLoading);
export const mfaRequired = derived(authStore, ($auth) => $auth.mfaRequired);
