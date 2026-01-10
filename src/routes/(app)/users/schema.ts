import { z } from 'zod';

export const userFormSchema = z.object({
	email: z.string().email('Invalid email address'),
	first_name: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters'),
	last_name: z.string().min(1, 'Last name is required').max(100, 'Last name must be less than 100 characters'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(100, 'Password must be less than 100 characters'),
	role_ids: z.array(z.string().uuid()).optional(),
	school_id: z.string().uuid().optional().or(z.literal(''))
});

export type UserFormSchema = typeof userFormSchema;

export const updateUserFormSchema = z.object({
	email: z.string().email('Invalid email address').optional(),
	first_name: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters').optional(),
	last_name: z.string().min(1, 'Last name is required').max(100, 'Last name must be less than 100 characters').optional(),
	school_id: z.string().uuid().optional().or(z.literal('')).nullable(),
	level_id: z.string().uuid().optional().or(z.literal('')).nullable(),
	branch_id: z.string().uuid().optional().or(z.literal('')).nullable(),
	date_of_birth: z.string().optional().or(z.literal('')).nullable(),
	grade_level: z.string().optional().or(z.literal('')).nullable()
});

export type UpdateUserFormSchema = typeof updateUserFormSchema;
