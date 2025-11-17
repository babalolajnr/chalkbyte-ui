import { goto } from '$app/navigation';
import { authStore } from '$lib/stores/auth.store';
import { get } from 'svelte/store';

export function requireAuth() {
	const auth = get(authStore);

	if (!auth.isAuthenticated) {
		goto('/login');
		return false;
	}

	return true;
}

export function requireGuest() {
	const auth = get(authStore);

	if (auth.isAuthenticated) {
		goto('/');
		return false;
	}

	return true;
}

export function requireRole(allowedRoles: string[]) {
	const auth = get(authStore);

	if (!auth.isAuthenticated) {
		goto('/login');
		return false;
	}

	if (auth.user && !allowedRoles.includes(auth.user.role)) {
		goto('/');
		return false;
	}

	return true;
}
