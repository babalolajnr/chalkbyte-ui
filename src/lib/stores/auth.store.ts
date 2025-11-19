import { writable, derived } from 'svelte/store';
import type { AuthState, User } from '$lib/types/auth';
import { authService } from '$lib/services/auth.service';

const initialState: AuthState = {
	user: null,
	accessToken: null,
	refreshToken: null,
	isAuthenticated: false,
	tempToken: null,
	mfaRequired: false
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,
		setUser: (user: User, accessToken: string, refreshToken?: string) => {
			if (typeof window !== 'undefined') {
				localStorage.setItem('access_token', accessToken);
				if (refreshToken) {
					localStorage.setItem('refresh_token', refreshToken);
				}
			}
			update((state) => ({
				...state,
				user,
				accessToken,
				refreshToken: refreshToken || state.refreshToken,
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
			if (typeof window !== 'undefined') {
				localStorage.removeItem('access_token');
				localStorage.removeItem('refresh_token');
			}
			set(initialState);
		},
		initialize: async () => {
			const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
			const refreshToken =
				typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
			if (token && refreshToken) {
				try {
					const response = await authService.refreshToken();
					update((state) => ({
						...state,
						user: response.user,
						accessToken: response.access_token,
						refreshToken: response.refresh_token,
						isAuthenticated: true,
						isLoading: false
					}));
				} catch {
					if (typeof window !== 'undefined') {
						localStorage.removeItem('access_token');
						localStorage.removeItem('refresh_token');
					}
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

// export const isAuthenticated = derived(authStore, ($auth) => $auth.isAuthenticated);
export const currentUser = derived(authStore, ($auth) => $auth.user);
// export const isLoading = derived(authStore, ($auth) => $auth.isLoading);
export const mfaRequired = derived(authStore, ($auth) => $auth.mfaRequired);
