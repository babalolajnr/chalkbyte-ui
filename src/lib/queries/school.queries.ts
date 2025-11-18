import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
import { schoolService } from '$lib/services/school.service';
import type { CreateSchoolDto } from '$lib/types/school';

// Query keys
export const schoolKeys = {
	all: ['schools'] as const,
	lists: () => [...schoolKeys.all, 'list'] as const,
	list: () => [...schoolKeys.lists()] as const,
	details: () => [...schoolKeys.all, 'detail'] as const,
	detail: (id: string) => [...schoolKeys.details(), id] as const
};

// Queries
export function useSchools() {
	return createQuery(() => ({
		queryKey: schoolKeys.list(),
		queryFn: () => schoolService.getAllSchools()
	}));
}

export function useSchool(id: string) {
	return createQuery(() => ({
		queryKey: schoolKeys.detail(id),
		queryFn: () => schoolService.getSchool(id),
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
