export interface UserSchool {
	id: string;
	name: string;
	address: string;
}

export interface UserLevel {
	id: string;
	name: string;
	description: string | null;
}

export interface UserBranch {
	id: string;
	name: string;
	description: string | null;
}

export interface UserRole {
	id: string;
	name: string;
	description: string;
	is_system_role: boolean;
}

export interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	date_of_birth: string | null;
	grade_level: string | null;
	school: UserSchool | null;
	level: UserLevel | null;
	branch: UserBranch | null;
	roles: UserRole[];
	created_at: string;
	updated_at: string;
}

export interface PaginationMeta {
	has_more: boolean;
	limit: number;
	offset: number | null;
	page: number | null;
	total: number;
}

export interface PaginatedUsersResponse {
	data: User[];
	meta: PaginationMeta;
}

export interface UserQueryParams {
	first_name?: string;
	last_name?: string;
	email?: string;
	role_id?: string;
	school_id?: string;
	limit?: number;
	offset?: number;
}

export interface CreateUserDto {
	email: string;
	first_name: string;
	last_name: string;
	password: string;
	role_ids?: string[];
	school_id?: string | null;
}

export interface UpdateUserDto {
	email?: string;
	first_name?: string;
	last_name?: string;
	school_id?: string | null;
	level_id?: string | null;
	branch_id?: string | null;
	date_of_birth?: string | null;
	grade_level?: string | null;
}

export interface UserFilterOptions {
	roles?: string[];
	schools?: string[];
	branches?: string[];
	levels?: string[];
}

export interface UserStats {
	total_users: number;
	active_users: number;
	users_by_role: Record<string, number>;
	users_by_school: Record<string, number>;
}
