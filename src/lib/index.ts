// place files you want to import through the `$lib` alias in this folder.

// Authentication exports
export { authService } from './services/auth.service';
export {
	authStore,
	isAuthenticated,
	currentUser,
	// isLoading,
	mfaRequired
} from './stores/auth.store';
export { requireAuth, requireGuest, requireRole } from './guards/auth.guard';
export * from './types/auth';
export * from './auth-utils';
export * from './queries/auth.queries';
