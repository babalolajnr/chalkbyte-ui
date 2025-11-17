import type { User } from '$lib/types/auth';

/**
 * Check if a user has a specific role
 */
export function hasRole(user: User | null, role: string | string[]): boolean {
	if (!user) return false;

	if (Array.isArray(role)) {
		return role.includes(user.role);
	}

	return user.role === role;
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null): boolean {
	return hasRole(user, 'admin');
}

/**
 * Check if a user is a teacher
 */
export function isTeacher(user: User | null): boolean {
	return hasRole(user, 'teacher');
}

/**
 * Check if a user is a student
 */
export function isStudent(user: User | null): boolean {
	return hasRole(user, 'student');
}

/**
 * Get user's full name
 */
export function getFullName(user: User | null): string {
	if (!user) return '';
	return `${user.first_name} ${user.last_name}`.trim();
}

/**
 * Get user's initials
 */
export function getInitials(user: User | null): string {
	if (!user) return '';

	const firstInitial = user.first_name?.[0] || '';
	const lastInitial = user.last_name?.[0] || '';

	return `${firstInitial}${lastInitial}`.toUpperCase();
}

/**
 * Format role for display
 */
export function formatRole(role: string): string {
	return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
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
 * Returns an object with validation results
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

	if (!/[A-Z]/.test(password)) {
		errors.push('Password must contain at least one uppercase letter');
	}

	if (!/[a-z]/.test(password)) {
		errors.push('Password must contain at least one lowercase letter');
	}

	if (!/[0-9]/.test(password)) {
		errors.push('Password must contain at least one number');
	}

	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		errors.push('Password must contain at least one special character');
	}

	// Determine strength
	const criteriaMet = 5 - errors.length;
	if (criteriaMet >= 5 && password.length >= 12) {
		strength = 'strong';
	} else if (criteriaMet >= 3 && password.length >= 8) {
		strength = 'medium';
	}

	return {
		isValid: errors.length === 0,
		errors,
		strength
	};
}

/**
 * Format OTP code with separator
 */
export function formatOTP(code: string): string {
	if (code.length <= 3) return code;
	return `${code.slice(0, 3)} ${code.slice(3)}`;
}

/**
 * Check if token is expired (basic JWT decode)
 */
export function isTokenExpired(token: string): boolean {
	try {
		const payload = JSON.parse(atob(token.split('.')[1]));
		const expirationTime = payload.exp * 1000; // Convert to milliseconds
		return Date.now() >= expirationTime;
	} catch {
		return true; // If we can't parse it, consider it expired
	}
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
	try {
		const payload = JSON.parse(atob(token.split('.')[1]));
		return new Date(payload.exp * 1000);
	} catch {
		return null;
	}
}

/**
 * Calculate time until token expires
 */
export function getTimeUntilExpiration(token: string): number {
	const expiration = getTokenExpiration(token);
	if (!expiration) return 0;

	const now = Date.now();
	const expirationTime = expiration.getTime();

	return Math.max(0, expirationTime - now);
}

/**
 * Format time remaining (e.g., "5 minutes", "2 hours")
 */
export function formatTimeRemaining(milliseconds: number): string {
	const seconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;
	if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
	if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
	return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/\//g, '&#x2F;');
}

/**
 * Generate a random recovery code format (for display purposes)
 */
export function formatRecoveryCode(code: string): string {
	// Format as XXXX-XXXX-XXXX
	return code.match(/.{1,4}/g)?.join('-') || code;
}
