import { rolesService } from '$lib/services/roles.service';
import type { CustomRoleWithPermissions, RoleQueryParams } from '$lib/types/roles';

interface UseRolesOptions {
	schoolId?: string;
	isSystemRole?: boolean;
	name?: string;
	limit?: number;
	autoFetch?: boolean;
}

export class UseRoles {
	roles = $state<CustomRoleWithPermissions[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);
	hasMore = $state(false);
	total = $state(0);

	#options: UseRolesOptions;

	constructor(options: UseRolesOptions = {}) {
		this.#options = { autoFetch: true, ...options };

		if (this.#options.autoFetch) {
			this.fetch();
		}
	}

	async fetch(params?: RoleQueryParams) {
		this.loading = true;
		this.error = null;

		try {
			const queryParams: RoleQueryParams = {
				...params
			};

			if (this.#options.schoolId) queryParams.school_id = this.#options.schoolId;
			if (this.#options.isSystemRole !== undefined)
				queryParams.is_system_role = this.#options.isSystemRole;
			if (this.#options.name) queryParams.name = this.#options.name;
			if (this.#options.limit) queryParams.limit = this.#options.limit;

			const response = await rolesService.getRoles(queryParams);
			this.roles = response.data;
			this.hasMore = response.meta.has_more;
			this.total = response.meta.total;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to fetch roles';
		} finally {
			this.loading = false;
		}
	}

	async refetch() {
		await this.fetch();
	}

	async create(data: Parameters<typeof rolesService.createRole>[0]) {
		this.loading = true;
		this.error = null;

		try {
			const role = await rolesService.createRole(data);
			this.roles = [...this.roles, role];
			return role;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to create role';
			throw err;
		} finally {
			this.loading = false;
		}
	}

	async update(id: string, data: Parameters<typeof rolesService.updateRole>[1]) {
		this.loading = true;
		this.error = null;

		try {
			const role = await rolesService.updateRole(id, data);
			this.roles = this.roles.map((r) => (r.id === id ? role : r));
			return role;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to update role';
			throw err;
		} finally {
			this.loading = false;
		}
	}

	async delete(id: string) {
		this.loading = true;
		this.error = null;

		try {
			await rolesService.deleteRole(id);
			this.roles = this.roles.filter((r) => r.id !== id);
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to delete role';
			throw err;
		} finally {
			this.loading = false;
		}
	}
}

export function useRoles(options: UseRolesOptions = {}) {
	return new UseRoles(options);
}
