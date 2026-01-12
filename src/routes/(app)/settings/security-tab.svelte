<script lang="ts">
	import { createMutation } from '@tanstack/svelte-query';
	import { userService } from '$lib/services/user.service';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let passwordForm = $state({
		current_password: '',
		new_password: '',
		confirm_password: ''
	});

	const changePasswordMutation = createMutation(() => ({
		mutationFn: (data: { current_password: string; new_password: string }) =>
			userService.changePassword(data),
		onSuccess: () => {
			passwordForm.current_password = '';
			passwordForm.new_password = '';
			passwordForm.confirm_password = '';
			toast.success('Password changed successfully');
		},
		onError: (error: Error) => {
			toast.error('Failed to change password', {
				description: error.message
			});
		}
	}));

	function handleChangePassword() {
		if (
			!passwordForm.current_password ||
			!passwordForm.new_password ||
			!passwordForm.confirm_password
		) {
			toast.error('Validation error', {
				description: 'Please fill in all fields'
			});
			return;
		}
		if (passwordForm.new_password !== passwordForm.confirm_password) {
			toast.error('Validation error', {
				description: 'New passwords do not match'
			});
			return;
		}
		if (passwordForm.new_password.length < 8) {
			toast.error('Validation error', {
				description: 'Password must be at least 8 characters long'
			});
			return;
		}
		changePasswordMutation.mutate({
			current_password: passwordForm.current_password,
			new_password: passwordForm.new_password
		});
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Change Password</Card.Title>
		<Card.Description>Update your password to keep your account secure</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="grid gap-4">
			<div class="grid gap-2">
				<Label for="current_password">Current Password</Label>
				<Input
					id="current_password"
					type="password"
					bind:value={passwordForm.current_password}
					disabled={changePasswordMutation.isPending}
					autocomplete="current-password"
				/>
			</div>
			<div class="grid gap-2">
				<Label for="new_password">New Password</Label>
				<Input
					id="new_password"
					type="password"
					bind:value={passwordForm.new_password}
					disabled={changePasswordMutation.isPending}
					autocomplete="new-password"
				/>
				<p class="text-sm text-muted-foreground">
					Password must be at least 8 characters long
				</p>
			</div>
			<div class="grid gap-2">
				<Label for="confirm_password">Confirm New Password</Label>
				<Input
					id="confirm_password"
					type="password"
					bind:value={passwordForm.confirm_password}
					disabled={changePasswordMutation.isPending}
					autocomplete="new-password"
				/>
			</div>
		</div>
	</Card.Content>
	<Card.Footer>
		<Button onclick={handleChangePassword} disabled={changePasswordMutation.isPending}>
			{changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
		</Button>
	</Card.Footer>
</Card.Root>
