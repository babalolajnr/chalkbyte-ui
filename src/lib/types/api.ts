export interface PaginationMeta {
	total: number;
	limit: number;
	offset: number;
	has_more: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: PaginationMeta;
}
