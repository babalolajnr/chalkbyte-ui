// User Module - Centralized exports for user management functionality

// Types
export type {
	User,
	PaginationMeta,
	PaginatedUsersResponse,
	UserQueryParams,
	CreateUserDto,
	UpdateUserDto,
	UserFilterOptions,
	UserStats
} from '$lib/types/user';

// Service
export { userService } from '$lib/services/user.service';
export type { UserProfile, UpdateUserProfileRequest, ChangePasswordRequest } from '$lib/services/user.service';

// Queries
export {
	userKeys,
	useUsers,
	useUser,
	useCurrentUserProfile,
	useCreateUser,
	useUpdateUser,
	useDeleteUser,
	useUpdateUserProfile,
	useChangePassword
} from '$lib/queries/user.queries';

// Store
export {
	userStore,
	selectedUserCount,
	hasSelectedUsers,
	currentPage,
	isUserSelected,
	activeFiltersCount,
	hasActiveFilters
} from '$lib/stores/user.store';

// Utilities
export {
	getUserFullName,
	getUserInitials,
	getUserDisplayName,
	isUserComplete,
	formatDateOfBirth,
	calculateAge,
	filterUsers,
	sortUsersByName,
	sortUsersByEmail,
	sortUsersByCreatedAt,
	groupUsersBySchool,
	buildUserQueryParams
} from '$lib/utils';

// Re-export validation utilities
export {
	isValidEmail,
	validatePassword
} from '$lib/utils';
