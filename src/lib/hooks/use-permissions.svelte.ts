import { SvelteSet } from 'svelte/reactivity';
import { rolesService } from '$lib/services/roles.service';
import type { Permission, PermissionQueryParams } from '$lib/types/roles';

interface UsePermissionsOptions {
	category?: string;
	limit?: number;
	autoFetch?: boolean;
}

export class UsePermissions {
	permissions = $state<Permission[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);
	hasMore = $state(false);
	total = $state(0);

	#options: UsePermissionsOptions;

	constructor(options: UsePermissionsOptions = {}) {
		this.#options = { autoFetch: true, ...options };

		if (this.#options.autoFetch) {
			this.fetch();
		}
	}

	async fetch(params?: PermissionQueryParams) {
		this.loading = true;
		this.error = null;

		try {
			const queryParams: PermissionQueryParams = {
				...params
			};

			if (this.#options.category) queryParams.category = this.#options.category;
			if (this.#options.limit) queryParams.limit = this.#options.limit;

			const response = await rolesService.getPermissions(queryParams);
			this.permissions = response.data;
			this.hasMore = response.meta.has_more;
			this.total = response.meta.total;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to fetch permissions';
		} finally {
			this.loading = false;
		}
	}

	async refetch() {
		await this.fetch();
	}

	async loadMore(offset: number) {
		this.loading = true;
		this.error = null;

		try {
			const queryParams: PermissionQueryParams = {
				offset
			};

			if (this.#options.category) queryParams.category = this.#options.category;
			if (this.#options.limit) queryParams.limit = this.#options.limit;

			const response = await rolesService.getPermissions(queryParams);
			this.permissions = [...this.permissions, ...response.data];
			this.hasMore = response.meta.has_more;
			this.total = response.meta.total;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load more permissions';
		} finally {
			this.loading = false;
		}
	}

	getByCategory(category: string): Permission[] {
		return this.permissions.filter((p) => p.category === category);
	}

	getCategories(): string[] {
		return [...new SvelteSet(this.permissions.map((p) => p.category))];
	}

	getGroupedByCategory(): Record<string, Permission[]> {
		return this.permissions.reduce(
			(acc, permission) => {
				if (!acc[permission.category]) {
					acc[permission.category] = [];
				}
				acc[permission.category].push(permission);
				return acc;
			},
			{} as Record<string, Permission[]>
		);
	}
}

export function usePermissions(options: UsePermissionsOptions = {}) {
	return new UsePermissions(options);
}
