<script lang="ts">
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { userService } from '$lib/services/user.service';
	import { permissionsStore } from '$lib/stores/permissions.store';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	const queryClient = useQueryClient();

	const userProfileQuery = createQuery(() => ({
		queryKey: ['user-profile'],
		queryFn: () => userService.getCurrentUserProfile()
	}));

	let profileForm = $state({
		first_name: '',
		last_name: ''
	});

	$effect(() => {
		if (userProfileQuery.data) {
			profileForm.first_name = userProfileQuery.data.user.first_name;
			profileForm.last_name = userProfileQuery.data.user.last_name;
		}
	});

	const updateProfileMutation = createMutation(() => ({
		mutationFn: (data: typeof profileForm) => userService.updateUserProfile(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-profile'] });
			toast.success('Profile updated successfully');
		},
		onError: (error: Error) => {
			toast.error('Failed to update profile', {
				description: error.message
			});
		}
	}));

	function handleUpdateProfile() {
		if (!profileForm.first_name || !profileForm.last_name) {
			toast.error('Validation error', {
				description: 'Please fill in all fields'
			});
			return;
		}
		updateProfileMutation.mutate(profileForm);
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Profile Information</Card.Title>
		<Card.Description>Update your personal information</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		{#if userProfileQuery.isLoading}
			<p class="text-muted-foreground">Loading...</p>
		{:else if userProfileQuery.error}
			<p class="text-destructive">Error loading profile: {userProfileQuery.error.message}</p>
		{:else if userProfileQuery.data}
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label for="first_name">First Name</Label>
					<Input
						id="first_name"
						bind:value={profileForm.first_name}
						disabled={updateProfileMutation.isPending}
					/>
				</div>
				<div class="grid gap-2">
					<Label for="last_name">Last Name</Label>
					<Input
						id="last_name"
						bind:value={profileForm.last_name}
						disabled={updateProfileMutation.isPending}
					/>
				</div>
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" value={userProfileQuery.data.user.email} disabled />
				</div>
				<div class="grid gap-2">
					<Label for="role">Role(s)</Label>
					<Input
						id="role"
						value={$permissionsStore.roles.map((r) => r.name).join(', ') || 'No roles assigned'}
						disabled
					/>
				</div>
				{#if userProfileQuery.data.school}
					<div class="grid gap-2">
						<Label for="school">School</Label>
						<Input id="school" value={userProfileQuery.data.school.name} disabled />
					</div>
				{/if}
			</div>
		{/if}
	</Card.Content>
	<Card.Footer>
		<Button
			onclick={handleUpdateProfile}
			disabled={updateProfileMutation.isPending || userProfileQuery.isLoading}
		>
			{updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
		</Button>
	</Card.Footer>
</Card.Root>
