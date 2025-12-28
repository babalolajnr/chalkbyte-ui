import type { User } from '$lib/types/auth';
import { authService } from '$lib/services/auth.service';
import { authStore } from '$lib/stores/auth.store';
import {
	hasRole as storeHasRole,
	hasAnyRole as storeHasAnyRole
} from '$lib/stores/permissions.store';

/**
 * Check if a user has a specific role (uses permissions store)
 */
export function hasRole(roleName: string): boolean {
	return storeHasRole(roleName);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(roleNames: string[]): boolean {
	return storeHasAnyRole(roleNames);
}

/**
 * Decode JWT token to extract expiration time
 */
function decodeJWT(token: string): { exp?: number } {
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);
		return JSON.parse(jsonPayload);
	} catch {
		return {};
	}
}

/**
 * Check if token is expired or will expire soon (within 5 minutes)
 */
export function shouldRefreshToken(token: string | null): boolean {
	if (!token) return false;

	const decoded = decodeJWT(token);
	if (!decoded.exp) return false;

	const expirationTime = decoded.exp * 1000;
	const currentTime = Date.now();
	const fiveMinutes = 5 * 60 * 1000;

	return expirationTime - currentTime < fiveMinutes;
}

/**
 * Automatically refresh token if needed
 */
export async function autoRefreshToken(): Promise<boolean> {
	const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

	if (!shouldRefreshToken(token)) {
		return true;
	}

	try {
		const response = await authService.refreshToken();
		authStore.setUser(
			response.user,
			response.access_token,
			response.refresh_token,
			response.roles,
			response.permissions
		);
		return true;
	} catch {
		authStore.logout();
		return false;
	}
}

/**
 * Setup automatic token refresh interval
 * Returns cleanup function
 */
export function setupTokenRefresh(intervalMs: number = 4 * 60 * 1000): () => void {
	const interval = setInterval(async () => {
		await autoRefreshToken();
	}, intervalMs);

	return () => clearInterval(interval);
}

/**
 * Check if user has System Admin role
 */
export function isSystemAdmin(): boolean {
	return hasRole('System Admin');
}

/**
 * Check if user has any admin-level role
 */
export function isAdmin(): boolean {
	return hasAnyRole(['System Admin', 'School Admin', 'Admin']);
}

/**
 * Check if user has Teacher role
 */
export function isTeacher(): boolean {
	return hasRole('Teacher');
}

/**
 * Check if user has Student role
 */
export function isStudent(): boolean {
	return hasRole('Student');
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
