import { HttpService } from './http.service';
import type {
	Level,
	LevelWithStudentCount,
	CreateLevelDto,
	UpdateLevelDto,
	LevelQueryParams,
	PaginatedLevelsResponse,
	AssignStudentsDto,
	AssignStudentsResponse,
	MoveStudentDto,
	LevelStudent
} from '$lib/types/level';

class LevelService extends HttpService {
	async createLevel(data: CreateLevelDto): Promise<Level> {
		return this.request<Level>('/api/levels', true, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async getLevels(params?: LevelQueryParams): Promise<PaginatedLevelsResponse> {
		const queryParams = new URLSearchParams();
		if (params?.name) queryParams.append('name', params.name);
		if (params?.page !== undefined) queryParams.append('page', params.page.toString());
		if (params?.per_page !== undefined) queryParams.append('per_page', params.per_page.toString());

		const url = queryParams.toString() ? `/api/levels?${queryParams.toString()}` : '/api/levels';
		return this.request<PaginatedLevelsResponse>(url, true);
	}

	async getLevel(id: string): Promise<LevelWithStudentCount> {
		return this.request<LevelWithStudentCount>(`/api/levels/${id}`, true);
	}

	async updateLevel(id: string, data: UpdateLevelDto): Promise<Level> {
		return this.request<Level>(`/api/levels/${id}`, true, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
	}

	async deleteLevel(id: string): Promise<void> {
		return this.request<void>(`/api/levels/${id}`, true, {
			method: 'DELETE'
		});
	}

	async assignStudents(levelId: string, data: AssignStudentsDto): Promise<AssignStudentsResponse> {
		return this.request<AssignStudentsResponse>(`/api/levels/${levelId}/students`, true, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async getLevelStudents(levelId: string): Promise<LevelStudent[]> {
		return this.request<LevelStudent[]>(`/api/levels/${levelId}/students`, true);
	}

	async moveStudent(studentId: string, data: MoveStudentDto): Promise<void> {
		return this.request<void>(`/api/levels/students/${studentId}/move`, true, {
			method: 'PATCH',
			body: JSON.stringify(data)
		});
	}

	async removeStudentFromLevel(studentId: string): Promise<void> {
		return this.request<void>(`/api/levels/students/${studentId}`, true, {
			method: 'DELETE'
		});
	}
}

export const levelService = new LevelService();
