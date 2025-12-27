export interface Level {
	id: string;
	name: string;
	description: string | null;
	school_id: string;
	created_at: string;
	updated_at: string;
}

export interface LevelWithStudentCount extends Level {
	student_count: number;
}

export interface CreateLevelDto {
	name: string;
	description?: string;
}

export interface UpdateLevelDto {
	name?: string;
	description?: string;
}

export interface LevelQueryParams {
	name?: string;
	page?: number;
	per_page?: number;
}

export interface LevelPaginationMeta {
	current_page: number;
	per_page: number;
	total_items: number;
	total_pages: number;
}

export interface PaginatedLevelsResponse {
	data: LevelWithStudentCount[];
	meta: LevelPaginationMeta;
}

export interface LevelStudent {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	role: 'student';
	school_id: string;
	created_at: string;
	updated_at: string;
}

export interface AssignStudentsDto {
	student_ids: string[];
}

export interface AssignStudentsResponse {
	assigned_count: number;
	failed_ids: string[];
}

export interface MoveStudentDto {
	level_id: string | null;
}
