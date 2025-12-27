import { z } from 'zod';

export const roleFormSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters'),
	description: z
		.string()
		.max(500, 'Description must be less than 500 characters')
		.optional()
		.or(z.literal('')),
	school_id: z.string().uuid().optional().or(z.literal('')),
	permission_ids: z.array(z.string().uuid()).optional()
});

export type RoleFormSchema = typeof roleFormSchema;

export const updateRoleFormSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters')
		.optional(),
	description: z
		.string()
		.max(500, 'Description must be less than 500 characters')
		.optional()
		.or(z.literal(''))
});

export type UpdateRoleFormSchema = typeof updateRoleFormSchema;
