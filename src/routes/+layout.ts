import { browser } from '$app/environment';
import { QueryClient } from '@tanstack/svelte-query';

export async function load() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				staleTime: 1000 * 60 * 5, // 5 minutes
				refetchOnWindowFocus: false,
				retry: 1
			}
		}
	});

	return { queryClient };
}
