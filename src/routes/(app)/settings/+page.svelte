<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import UserIcon from '@lucide/svelte/icons/user';
	import LockIcon from '@lucide/svelte/icons/lock';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import KeyIcon from '@lucide/svelte/icons/key';
	import ProfileTab from './profile-tab.svelte';
	import SecurityTab from './security-tab.svelte';
	import MfaTab from './mfa-tab.svelte';
	import PermissionsTab from './permissions-tab.svelte';
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Settings</h1>
		<p class="text-muted-foreground">Manage your account settings and preferences</p>
	</div>

	<Tabs.Root value="profile" class="w-full">
		<Tabs.List class="grid w-full grid-cols-4">
			<Tabs.Trigger value="profile">
				<UserIcon class="mr-2 h-4 w-4" />
				Profile
			</Tabs.Trigger>
			<Tabs.Trigger value="security">
				<LockIcon class="mr-2 h-4 w-4" />
				Security
			</Tabs.Trigger>
			<Tabs.Trigger value="mfa">
				<ShieldIcon class="mr-2 h-4 w-4" />
				Two-Factor Auth
			</Tabs.Trigger>
			<Tabs.Trigger value="permissions">
				<KeyIcon class="mr-2 h-4 w-4" />
				Roles & Permissions
			</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="profile" class="space-y-4">
			<ProfileTab />
		</Tabs.Content>

		<Tabs.Content value="security" class="space-y-4">
			<SecurityTab />
		</Tabs.Content>

		<Tabs.Content value="mfa" class="space-y-4">
			<MfaTab />
		</Tabs.Content>

		<Tabs.Content value="permissions" class="space-y-4">
			<PermissionsTab />
		</Tabs.Content>
	</Tabs.Root>
</div>
