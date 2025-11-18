import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { authStore } from '$lib/stores/auth.store';
import { get } from 'svelte/store';

export const ssr = false;

export async function load({ url }) {
	if (browser) {
		// const auth = get(authStore);

		// Wait for auth to initialize if it's still loading
		// if (auth.isLoading) {
		// 	await new Promise<void>((resolve) => {
		// 		const unsubscribe = authStore.subscribe((state) => {
		// 			if (!state.isLoading) {
		// 				unsubscribe();
		// 				resolve();
		// 			}
		// 		});
		// 	});
		// }

		const currentAuth = get(authStore);

		// Allow OTP route if MFA is required
		if (currentAuth.mfaRequired && url.pathname === '/otp') {
			return {};
		}

		// Redirect authenticated users away from auth pages
		if (currentAuth.isAuthenticated) {
			goto(resolve('/dashboard'));
			return { redirect: true };
		}
	}

	return {};
}
