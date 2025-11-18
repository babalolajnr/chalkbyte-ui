import { writable, derived } from 'svelte/store';
import type { AuthState, User } from '$lib/types/auth';
import { mfaService } from '$lib/services/mfa.service';

const initialState: AuthState = {
	user: null,
	accessToken: null,
	isAuthenticated: false,
	tempToken: null,
	mfaRequired: false
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,
		setUser: (user: User, accessToken: string) => {
			if (typeof window !== 'undefined') {
				localStorage.setItem('access_token', accessToken);
			}
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
			if (typeof window !== 'undefined') {
				localStorage.removeItem('access_token');
			}
			set(initialState);
		},
		initialize: async () => {
			const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
			if (token) {
				try {
					await mfaService.getMFAStatus();
					update((state) => ({
						...state,
						accessToken: token,
						isAuthenticated: true,
						isLoading: false
					}));
				} catch {
					if (typeof window !== 'undefined') {
						localStorage.removeItem('access_token');
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

export const isAuthenticated = derived(authStore, ($auth) => $auth.isAuthenticated);
export const currentUser = derived(authStore, ($auth) => $auth.user);
// export const isLoading = derived(authStore, ($auth) => $auth.isLoading);
export const mfaRequired = derived(authStore, ($auth) => $auth.mfaRequired);
