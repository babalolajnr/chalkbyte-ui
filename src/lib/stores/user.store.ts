import { writable, derived } from 'svelte/store';
import type { User, UserQueryParams } from '$lib/types/user';

interface UserStoreState {
	selectedUser: User | null;
	filters: UserQueryParams;
	searchQuery: string;
	selectedUsers: Set<string>;
	viewMode: 'grid' | 'list';
	sortBy: 'name' | 'email' | 'created_at';
	sortDirection: 'asc' | 'desc';
}

const initialState: UserStoreState = {
	selectedUser: null,
	filters: {
		limit: 10,
		offset: 0
	},
	searchQuery: '',
	selectedUsers: new Set(),
	viewMode: 'list',
	sortBy: 'created_at',
	sortDirection: 'desc'
};

function createUserStore() {
	const { subscribe, set, update } = writable<UserStoreState>(initialState);

	return {
		subscribe,

		// Selected User
		setSelectedUser: (user: User | null) => {
			update((state) => ({ ...state, selectedUser: user }));
		},

		clearSelectedUser: () => {
			update((state) => ({ ...state, selectedUser: null }));
		},

		// Filters
		setFilters: (filters: Partial<UserQueryParams>) => {
			update((state) => ({
				...state,
				filters: { ...state.filters, ...filters }
			}));
		},

		updateFilter: (key: keyof UserQueryParams, value: string | number | undefined) => {
			update((state) => ({
				...state,
				filters: { ...state.filters, [key]: value }
			}));
		},

		clearFilters: () => {
			update((state) => ({
				...state,
				filters: { limit: 10, offset: 0 }
			}));
		},

		// Search
		setSearchQuery: (query: string) => {
			update((state) => ({ ...state, searchQuery: query }));
		},

		clearSearch: () => {
			update((state) => ({ ...state, searchQuery: '' }));
		},

		// Pagination
		setPage: (page: number) => {
			update((state) => {
				const limit = state.filters.limit || 10;
				return {
					...state,
					filters: { ...state.filters, offset: page * limit }
				};
			});
		},

		setLimit: (limit: number) => {
			update((state) => ({
				...state,
				filters: { ...state.filters, limit, offset: 0 }
			}));
		},

		nextPage: () => {
			update((state) => {
				const limit = state.filters.limit || 10;
				const currentOffset = state.filters.offset || 0;
				return {
					...state,
					filters: { ...state.filters, offset: currentOffset + limit }
				};
			});
		},

		previousPage: () => {
			update((state) => {
				const limit = state.filters.limit || 10;
				const currentOffset = state.filters.offset || 0;
				const newOffset = Math.max(0, currentOffset - limit);
				return {
					...state,
					filters: { ...state.filters, offset: newOffset }
				};
			});
		},

		// Multi-select
		toggleUserSelection: (userId: string) => {
			update((state) => {
				const newSelected = new Set(state.selectedUsers);
				if (newSelected.has(userId)) {
					newSelected.delete(userId);
				} else {
					newSelected.add(userId);
				}
				return { ...state, selectedUsers: newSelected };
			});
		},

		selectUser: (userId: string) => {
			update((state) => {
				const newSelected = new Set(state.selectedUsers);
				newSelected.add(userId);
				return { ...state, selectedUsers: newSelected };
			});
		},

		deselectUser: (userId: string) => {
			update((state) => {
				const newSelected = new Set(state.selectedUsers);
				newSelected.delete(userId);
				return { ...state, selectedUsers: newSelected };
			});
		},

		selectAllUsers: (userIds: string[]) => {
			update((state) => ({
				...state,
				selectedUsers: new Set(userIds)
			}));
		},

		clearSelection: () => {
			update((state) => ({
				...state,
				selectedUsers: new Set()
			}));
		},

		// View Mode
		setViewMode: (mode: 'grid' | 'list') => {
			update((state) => ({ ...state, viewMode: mode }));
		},

		toggleViewMode: () => {
			update((state) => ({
				...state,
				viewMode: state.viewMode === 'grid' ? 'list' : 'grid'
			}));
		},

		// Sorting
		setSorting: (sortBy: 'name' | 'email' | 'created_at', sortDirection: 'asc' | 'desc') => {
			update((state) => ({ ...state, sortBy, sortDirection }));
		},

		toggleSortDirection: () => {
			update((state) => ({
				...state,
				sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc'
			}));
		},

		// Reset
		reset: () => {
			set(initialState);
		}
	};
}

export const userStore = createUserStore();

// Derived stores
export const selectedUserCount = derived(userStore, ($store) => $store.selectedUsers.size);

export const hasSelectedUsers = derived(userStore, ($store) => $store.selectedUsers.size > 0);

export const currentPage = derived(userStore, ($store) => {
	const limit = $store.filters.limit || 10;
	const offset = $store.filters.offset || 0;
	return Math.floor(offset / limit);
});

export const isUserSelected = derived(
	userStore,
	($store) => (userId: string) => $store.selectedUsers.has(userId)
);

export const activeFiltersCount = derived(userStore, ($store) => {
	let count = 0;
	if ($store.filters.first_name) count++;
	if ($store.filters.last_name) count++;
	if ($store.filters.email) count++;
	if ($store.filters.role_id) count++;
	if ($store.filters.school_id) count++;
	if ($store.searchQuery) count++;
	return count;
});

export const hasActiveFilters = derived(activeFiltersCount, ($count) => $count > 0);
