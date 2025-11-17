<script lang="ts">
	import { onMount } from 'svelte';
	import { requireAuth } from '$lib/guards/auth.guard';
	import { currentUser, authStore } from '$lib/stores/auth.store';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { goto } from '$app/navigation';

	onMount(() => {
		requireAuth();
	});

	function handleLogout() {
		authStore.logout();
		goto('/login');
	}
</script>

<div class="min-h-svh bg-gray-50 p-6">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
				<p class="text-gray-600">Welcome back, {$currentUser?.first_name || 'User'}!</p>
			</div>
			<Button onclick={handleLogout} variant="outline">Logout</Button>
		</div>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			<Card.Root>
				<Card.Header>
					<Card.Title>Profile Information</Card.Title>
				</Card.Header>
				<Card.Content>
					<dl class="space-y-2">
						<div>
							<dt class="text-sm font-medium text-gray-500">Email</dt>
							<dd class="text-sm text-gray-900">{$currentUser?.email}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500">Name</dt>
							<dd class="text-sm text-gray-900">
								{$currentUser?.first_name}
								{$currentUser?.last_name}
							</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500">Role</dt>
							<dd class="text-sm text-gray-900 capitalize">{$currentUser?.role}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500">School ID</dt>
							<dd class="text-sm text-gray-900">{$currentUser?.school_id}</dd>
						</div>
					</dl>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Security Settings</Card.Title>
					<Card.Description>Manage your account security</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-2">
					<Button href="/settings/mfa" class="w-full" variant="outline">
						Manage MFA
					</Button>
					<Button href="/settings/password" class="w-full" variant="outline">
						Change Password
					</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Quick Actions</Card.Title>
					<Card.Description>Common tasks</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-2">
					<Button href="/courses" class="w-full" variant="outline">View Courses</Button>
					<Button href="/profile" class="w-full" variant="outline">Edit Profile</Button>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
