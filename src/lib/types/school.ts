export interface School {
	id: string;
	name: string;
	address: string | null;
}

export interface CreateSchoolDto {
	name: string;
	address?: string | null;
}

export interface SchoolsResponse {
	schools: School[];
}
