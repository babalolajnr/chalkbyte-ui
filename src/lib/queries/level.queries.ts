import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
import { levelService } from '$lib/services/level.service';
import type {
	LevelQueryParams,
	CreateLevelDto,
	UpdateLevelDto,
	AssignStudentsDto
} from '$lib/types/level';

// Query keys
export const levelKeys = {
	all: ['levels'] as const,
	lists: () => [...levelKeys.all, 'list'] as const,
	list: () => [...levelKeys.lists()] as const,
	details: () => [...levelKeys.all, 'detail'] as const,
	detail: (id: string) => [...levelKeys.details(), id] as const,
	students: (id: string) => [...levelKeys.details(), id, 'students'] as const
};

// Queries
export function useLevels(params?: LevelQueryParams) {
	return createQuery(() => ({
		queryKey: [...levelKeys.list(), params],
		queryFn: () => levelService.getLevels(params)
	}));
}

export function useLevel(id: string) {
	return createQuery(() => ({
		queryKey: levelKeys.detail(id),
		queryFn: () => levelService.getLevel(id),
		enabled: !!id
	}));
}

export function useLevelStudents(id: string) {
	return createQuery(() => ({
		queryKey: levelKeys.students(id),
		queryFn: () => levelService.getLevelStudents(id),
		enabled: !!id
	}));
}

// Mutations
export function useCreateLevel() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: (data: CreateLevelDto) => levelService.createLevel(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: levelKeys.list() });
		}
	}));
}

export function useUpdateLevel() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: ({ id, data }: { id: string; data: UpdateLevelDto }) =>
			levelService.updateLevel(id, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: levelKeys.list() });
			queryClient.invalidateQueries({ queryKey: levelKeys.detail(variables.id) });
		}
	}));
}

export function useDeleteLevel() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: (id: string) => levelService.deleteLevel(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: levelKeys.list() });
		}
	}));
}

export function useAssignStudents() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: ({ levelId, data }: { levelId: string; data: AssignStudentsDto }) =>
			levelService.assignStudents(levelId, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: levelKeys.students(variables.levelId) });
			queryClient.invalidateQueries({ queryKey: levelKeys.detail(variables.levelId) });
			queryClient.invalidateQueries({ queryKey: levelKeys.list() });
		}
	}));
}

export function useMoveStudent() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: ({ studentId, levelId }: { studentId: string; levelId: string | null }) =>
			levelService.moveStudent(studentId, { level_id: levelId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: levelKeys.all });
		}
	}));
}

export function useRemoveStudentFromLevel() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: (studentId: string) => levelService.removeStudentFromLevel(studentId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: levelKeys.all });
		}
	}));
}
