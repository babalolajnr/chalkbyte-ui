import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
import { userService } from '$lib/services/user.service';
import type {
	UserQueryParams,
	CreateUserDto,
	UpdateUserDto
} from '$lib/types/user';

// Query keys
export const userKeys = {
	all: ['users'] as const,
	lists: () => [...userKeys.all, 'list'] as const,
	list: (params?: UserQueryParams) => [...userKeys.lists(), params] as const,
	details: () => [...userKeys.all, 'detail'] as const,
	detail: (id: string) => [...userKeys.details(), id] as const,
	profile: () => [...userKeys.all, 'profile'] as const
};

// Queries
export function useUsers(params?: UserQueryParams) {
	return createQuery(() => ({
		queryKey: userKeys.list(params),
		queryFn: () => userService.getAllUsers(params)
	}));
}

export function useUser(id: string) {
	return createQuery(() => ({
		queryKey: userKeys.detail(id),
		queryFn: () => userService.getUser(id),
		enabled: !!id
	}));
}

export function useCurrentUserProfile() {
	return createQuery(() => ({
		queryKey: userKeys.profile(),
		queryFn: () => userService.getCurrentUserProfile()
	}));
}

// Mutations
export function useCreateUser() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: (data: CreateUserDto) => userService.createUser(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
		}
	}));
}

export function useUpdateUser() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
			userService.updateUser(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
			queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
		}
	}));
}

export function useDeleteUser() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: (id: string) => userService.deleteUser(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
		}
	}));
}

export function useUpdateUserProfile() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: (data: { first_name?: string; last_name?: string }) =>
			userService.updateUserProfile(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.profile() });
		}
	}));
}

export function useChangePassword() {
	return createMutation(() => ({
		mutationFn: (data: { current_password: string; new_password: string }) =>
			userService.changePassword(data)
	}));
}
