import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

// User Utilities
import type { User } from '$lib/types/user';

/**
 * Get user's full name
 */
export function getUserFullName(user: User | null | undefined): string {
	if (!user) return '';
	return `${user.first_name} ${user.last_name}`.trim();
}

/**
 * Get user's initials
 */
export function getUserInitials(user: User | null | undefined): string {
	if (!user) return '';
	const firstInitial = user.first_name?.[0] || '';
	const lastInitial = user.last_name?.[0] || '';
	return `${firstInitial}${lastInitial}`.toUpperCase();
}

/**
 * Format user display name with email
 */
export function getUserDisplayName(user: User | null | undefined): string {
	if (!user) return '';
	const fullName = getUserFullName(user);
	return fullName ? `${fullName} (${user.email})` : user.email;
}

/**
 * Check if user has required fields
 */
export function isUserComplete(user: User | null | undefined): boolean {
	if (!user) return false;
	return !!(user.email && user.first_name && user.last_name);
}

/**
 * Format date of birth
 */
export function formatDateOfBirth(dateString: string | null): string {
	if (!dateString) return 'Not set';
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	} catch {
		return 'Invalid date';
	}
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string | null): number | null {
	if (!dateOfBirth) return null;
	try {
		const today = new Date();
		const birthDate = new Date(dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}

		return age;
	} catch {
		return null;
	}
}

/**
 * Filter users by search query
 */
export function filterUsers(users: User[], query: string): User[] {
	if (!query.trim()) return users;

	const lowerQuery = query.toLowerCase();
	return users.filter(
		(user) =>
			user.first_name.toLowerCase().includes(lowerQuery) ||
			user.last_name.toLowerCase().includes(lowerQuery) ||
			user.email.toLowerCase().includes(lowerQuery)
	);
}

/**
 * Sort users by name
 */
export function sortUsersByName(users: User[], direction: 'asc' | 'desc' = 'asc'): User[] {
	return [...users].sort((a, b) => {
		const nameA = getUserFullName(a).toLowerCase();
		const nameB = getUserFullName(b).toLowerCase();

		if (direction === 'asc') {
			return nameA.localeCompare(nameB);
		} else {
			return nameB.localeCompare(nameA);
		}
	});
}

/**
 * Sort users by email
 */
export function sortUsersByEmail(users: User[], direction: 'asc' | 'desc' = 'asc'): User[] {
	return [...users].sort((a, b) => {
		const emailA = a.email.toLowerCase();
		const emailB = b.email.toLowerCase();

		if (direction === 'asc') {
			return emailA.localeCompare(emailB);
		} else {
			return emailB.localeCompare(emailA);
		}
	});
}

/**
 * Sort users by creation date
 */
export function sortUsersByCreatedAt(users: User[], direction: 'asc' | 'desc' = 'desc'): User[] {
	return [...users].sort((a, b) => {
		const dateA = new Date(a.created_at).getTime();
		const dateB = new Date(b.created_at).getTime();

		if (direction === 'asc') {
			return dateA - dateB;
		} else {
			return dateB - dateA;
		}
	});
}

/**
 * Group users by school
 */
export function groupUsersBySchool(users: User[]): Record<string, User[]> {
	return users.reduce(
		(acc, user) => {
			const schoolId = user.school?.id || 'no_school';
			if (!acc[schoolId]) {
				acc[schoolId] = [];
			}
			acc[schoolId].push(user);
			return acc;
		},
		{} as Record<string, User[]>
	);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
	isValid: boolean;
	errors: string[];
	strength: 'weak' | 'medium' | 'strong';
} {
	const errors: string[] = [];
	let strength: 'weak' | 'medium' | 'strong' = 'weak';

	if (password.length < 8) {
		errors.push('Password must be at least 8 characters long');
	}

	const hasUpperCase = /[A-Z]/.test(password);
	const hasLowerCase = /[a-z]/.test(password);
	const hasNumbers = /\d/.test(password);
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

	if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
	if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
	if (!hasNumbers) errors.push('Password must contain at least one number');
	if (!hasSpecialChar) errors.push('Password must contain at least one special character');

	const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(
		Boolean
	).length;

	if (password.length >= 12 && strengthScore >= 3) {
		strength = 'strong';
	} else if (password.length >= 8 && strengthScore >= 2) {
		strength = 'medium';
	}

	return {
		isValid: errors.length === 0,
		errors,
		strength
	};
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSeconds < 60) return 'Just now';
	if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
	if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - 3) + '...';
}

/**
 * Build query parameters for user filtering
 */
export function buildUserQueryParams(filters: {
	search?: string;
	roleId?: string;
	schoolId?: string;
	limit?: number;
	offset?: number;
}): Record<string, string> {
	const params: Record<string, string> = {};

	if (filters.search) {
		params.email = filters.search;
	}
	if (filters.roleId) {
		params.role_id = filters.roleId;
	}
	if (filters.schoolId) {
		params.school_id = filters.schoolId;
	}
	if (filters.limit !== undefined) {
		params.limit = filters.limit.toString();
	}
	if (filters.offset !== undefined) {
		params.offset = filters.offset.toString();
	}

	return params;
}
