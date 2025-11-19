import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
import { schoolService } from '$lib/services/school.service';
import type { CreateSchoolDto, SchoolQueryParams, UserQueryParams } from '$lib/types/school';

// Query keys
export const schoolKeys = {
	all: ['schools'] as const,
	lists: () => [...schoolKeys.all, 'list'] as const,
	list: () => [...schoolKeys.lists()] as const,
	details: () => [...schoolKeys.all, 'detail'] as const,
	detail: (id: string) => [...schoolKeys.details(), id] as const,
	fullInfo: (id: string) => [...schoolKeys.details(), id, 'full-info'] as const,
	students: (id: string) => [...schoolKeys.details(), id, 'students'] as const,
	admins: (id: string) => [...schoolKeys.details(), id, 'admins'] as const
};

// Queries
export function useSchools(params?: SchoolQueryParams) {
	return createQuery(() => ({
		queryKey: [...schoolKeys.list(), params],
		queryFn: () => schoolService.getAllSchools(params)
	}));
}

export function useSchool(id: string) {
	return createQuery(() => ({
		queryKey: schoolKeys.detail(id),
		queryFn: () => schoolService.getSchool(id),
		enabled: !!id
	}));
}

export function useSchoolFullInfo(id: string) {
	return createQuery(() => ({
		queryKey: schoolKeys.fullInfo(id),
		queryFn: () => schoolService.getSchoolFullInfo(id),
		enabled: !!id
	}));
}

export function useSchoolStudents(id: string, params?: UserQueryParams) {
	return createQuery(() => ({
		queryKey: [...schoolKeys.students(id), params],
		queryFn: () => schoolService.getSchoolStudents(id, params),
		enabled: !!id
	}));
}

export function useSchoolAdmins(id: string, params?: UserQueryParams) {
	return createQuery(() => ({
		queryKey: [...schoolKeys.admins(id), params],
		queryFn: () => schoolService.getSchoolAdmins(id, params),
		enabled: !!id
	}));
}

// Mutations
export function useCreateSchool() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: (data: CreateSchoolDto) => schoolService.createSchool(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: schoolKeys.list() });
		}
	}));
}

export function useDeleteSchool() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: (id: string) => schoolService.deleteSchool(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: schoolKeys.list() });
		}
	}));
}
