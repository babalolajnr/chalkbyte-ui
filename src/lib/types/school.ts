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
