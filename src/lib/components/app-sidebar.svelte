<script lang="ts" module>
	import LifeBuoyIcon from '@lucide/svelte/icons/life-buoy';
	import SendIcon from '@lucide/svelte/icons/send';
	import SchoolIcon from '@lucide/svelte/icons/school';
	import LayersIcon from '@lucide/svelte/icons/layers';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import UsersIcon from '@lucide/svelte/icons/users';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import { SystemPermission, SystemRole } from '$lib/types/permissions';

	const navMainConfig = [
		{
			title: 'Levels',
			route: '/levels',
			icon: LayersIcon,
			permission: SystemPermission.LEVELS_READ
		},
		{
			title: 'Roles',
			route: '/roles',
			icon: ShieldIcon,
			permission: SystemPermission.ROLES_READ
		},
		{
			title: 'Users',
			route: '/users',
			icon: UsersIcon,
			permission: SystemPermission.USERS_READ
		},
		{
			title: 'Settings',
			route: '/settings',
			icon: SettingsIcon,
			permission: SystemPermission.SETTINGS_READ
		}
	];

	const navSecondaryConfig = [
		{
			title: 'Support',
			url: '#',
			icon: LifeBuoyIcon
		},
		{
			title: 'Feedback',
			url: '#',
			icon: SendIcon
		}
	];

	const userData = {
		name: 'shadcn',
		email: 'm@example.com',
		avatar: '/avatars/shadcn.jpg'
	};
</script>

<script lang="ts">
	import NavMain from './nav-main.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavUser from './nav-user.svelte';
	import ModeToggle from './mode-toggle.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import CommandIcon from '@lucide/svelte/icons/command';
	import type { ComponentProps } from 'svelte';
	import { hasPermission, hasRole, permissionsStore } from '$lib/stores/permissions.store';
	import { authStore } from '$lib/stores/auth.store';
	import { resolve } from '$app/paths';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	// Filter navigation items based on user permissions and resolve URLs
	const filteredNavMain = $derived.by(() => {
		// Access the store to create reactivity
		void $permissionsStore;

		const isSuperAdmin = hasRole(SystemRole.SUPER_ADMIN);
		const userSchool = $authStore.user?.school;

		// Build nav items dynamically
		const items: Array<{
			title: string;
			route: string;
			icon: typeof SchoolIcon;
			permission?: string;
		}> = [];

		// Add school link based on role
		if (hasPermission(SystemPermission.SCHOOLS_READ)) {
			if (isSuperAdmin) {
				items.push({
					title: 'Schools',
					route: '/schools',
					icon: SchoolIcon,
					permission: SystemPermission.SCHOOLS_READ
				});
			} else if (userSchool?.id) {
				items.push({
					title: 'My School',
					route: '/school',
					icon: SchoolIcon,
					permission: SystemPermission.SCHOOLS_READ
				});
			}
		}

		// Add remaining nav items from config
		return [
			...items,
			...navMainConfig.filter((item) => {
				if (!item.permission) return true;
				return hasPermission(item.permission);
			})
		].map((item) => ({
			title: item.title,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			url: resolve(item.route as any),
			icon: item.icon,
			permission: item.permission
		}));
	});

	// Resolve secondary nav URLs (these are external/hash links so no resolve needed)
	const navSecondary = navSecondaryConfig;
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href={resolve('/')} {...props} data-sveltekit-preload-data="hover">
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<CommandIcon class="size-4" />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-medium">Acme Inc</span>
								<span class="truncate text-xs">Enterprise</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={filteredNavMain} />
		<NavSecondary items={navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<div class="flex items-center justify-between gap-2 px-2 py-2">
			<span class="text-sm text-sidebar-foreground/70">Theme</span>
			<ModeToggle />
		</div>
		<NavUser user={userData} />
	</Sidebar.Footer>
</Sidebar.Root>
