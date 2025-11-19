import type { PaginationMeta } from './api';

export interface School {
	id: string;
	name: string;
	address: string | null;
}

export interface CreateSchoolDto {
	name: string;
	address?: string | null;
}

export interface PaginatedSchoolsResponse {
	data: School[];
	meta: PaginationMeta;
}

export interface SchoolQueryParams {
	name?: string;
	address?: string;
	limit?: number;
	offset?: number;
}

export interface SchoolFullInfo {
	id: string;
	name: string;
	address: string | null;
	total_admins: number;
	total_students: number;
	total_teachers: number;
}

export interface SchoolUser {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	role: 'system_admin' | 'admin' | 'teacher' | 'student';
	school_id: string | null;
}

export interface PaginatedUsersResponse {
	data: SchoolUser[];
	meta: PaginationMeta;
}

export interface UserQueryParams {
	first_name?: string;
	last_name?: string;
	email?: string;
	limit?: number;
	offset?: number;
}
