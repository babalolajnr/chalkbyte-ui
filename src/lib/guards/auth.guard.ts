import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { authStore } from '$lib/stores/auth.store';
import { get } from 'svelte/store';

export function requireAuth() {
	const auth = get(authStore);

	if (!auth.isAuthenticated) {
		goto(resolve('/login'));
		return false;
	}

	return true;
}

export function requireGuest() {
	const auth = get(authStore);

	if (auth.isAuthenticated) {
		goto(resolve('/'));
		return false;
	}

	return true;
}

export function requireRole(allowedRoles: string[]) {
	const auth = get(authStore);

	if (!auth.isAuthenticated) {
		goto(resolve('/login'));
		return false;
	}

	if (auth.user && !allowedRoles.includes(auth.user.role)) {
		goto(resolve('/'));
		return false;
	}

	return true;
}
