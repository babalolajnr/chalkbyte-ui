<script lang="ts" module>
	import LifeBuoyIcon from '@lucide/svelte/icons/life-buoy';
	import SendIcon from '@lucide/svelte/icons/send';
	import SchoolIcon from '@lucide/svelte/icons/school';
	import LayersIcon from '@lucide/svelte/icons/layers';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import UsersIcon from '@lucide/svelte/icons/users';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import { SystemPermission } from '$lib/types/permissions';

	const navMainConfig = [
		{
			title: 'Schools',
			route: '/schools' as const,
			icon: SchoolIcon,
			permission: SystemPermission.SCHOOLS_READ
		},
		{
			title: 'Levels',
			route: '/levels' as const,
			icon: LayersIcon,
			permission: SystemPermission.LEVELS_READ
		},
		{
			title: 'Roles',
			route: '/roles' as const,
			icon: ShieldIcon,
			permission: SystemPermission.ROLES_READ
		},
		{
			title: 'Users',
			route: '/users' as const,
			icon: UsersIcon,
			permission: SystemPermission.USERS_READ
		},
		{
			title: 'Settings',
			route: '/settings' as const,
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
	import { hasPermission, permissionsStore } from '$lib/stores/permissions.store';
	import { resolve } from '$app/paths';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	// Filter navigation items based on user permissions and resolve URLs
	const filteredNavMain = $derived.by(() => {
		// Access the store to create reactivity
		void $permissionsStore;

		return navMainConfig
			.filter((item) => {
				// If no permission is required, show the item
				if (!item.permission) return true;
				// Check if user has the required permission
				return hasPermission(item.permission);
			})
			.map((item) => ({
				title: item.title,
				url: resolve(item.route),
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
