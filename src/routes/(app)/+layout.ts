import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

export const ssr = false;

export async function load() {
	if (browser) {
		const accessToken = localStorage.getItem('access_token');
		if (!accessToken) {
			goto(resolve('/login'));
			return { redirect: true };
		}
	}

	return {};
}
