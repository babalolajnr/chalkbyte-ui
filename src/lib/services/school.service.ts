import { HttpService } from './http.service';
import type { School, CreateSchoolDto } from '$lib/types/school';

class SchoolService extends HttpService {
	async getAllSchools(): Promise<School[]> {
		return this.request<School[]>('/api/schools', true);
	}

	async getSchool(id: string): Promise<School> {
		return this.request<School>(`/api/schools/${id}`);
	}

	async createSchool(data: CreateSchoolDto): Promise<School> {
		return this.request<School>('/api/schools', true, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async deleteSchool(id: string): Promise<void> {
		return this.request<void>(`/api/schools/${id}`, true, {
			method: 'DELETE'
		});
	}
}

export const schoolService = new SchoolService();
