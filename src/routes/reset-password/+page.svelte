<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription
	} from '$lib/components/ui/field/index.js';
	import { useResetPassword } from '$lib/queries/auth.queries';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';

	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordError = $state('');

	const token = $derived($page.url.searchParams.get('token') || '');
	const resetMutation = useResetPassword();

	function handleSubmit(e: Event) {
		e.preventDefault();
		passwordError = '';

		if (newPassword !== confirmPassword) {
			passwordError = 'Passwords do not match';
			return;
		}

		if (newPassword.length < 8) {
			passwordError = 'Password must be at least 8 characters';
			return;
		}

		if (!token) {
			passwordError = 'Invalid or missing reset token';
			return;
		}

		resetMutation.mutate({ token, new_password: newPassword });
	}
</script>

<div class="flex min-h-svh w-full items-center justify-center px-4">
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Reset Password</Card.Title>
			<Card.Description>
				{#if resetMutation.isSuccess}
					Your password has been reset successfully
				{:else}
					Enter your new password
				{/if}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if resetMutation.isSuccess}
				<div class="space-y-4">
					<div class="rounded-md bg-green-50 p-3 text-sm text-green-800">
						{resetMutation.data?.message || 'Password reset successful. You can now log in with your new password.'}
					</div>
					<a href={resolve('/login')} class="block" data-sveltekit-reload="off">
						<Button class="w-full">Go to Login</Button>
					</a>
				</div>
			{:else}
				<form onsubmit={handleSubmit}>
					<FieldGroup>
						{#if resetMutation.isError}
							<div class="rounded-md bg-red-50 p-3 text-sm text-red-800">
								{resetMutation.error?.message || 'Failed to reset password. Please try again.'}
							</div>
						{/if}
						{#if passwordError}
							<div class="rounded-md bg-red-50 p-3 text-sm text-red-800">
								{passwordError}
							</div>
						{/if}
						{#if !token}
							<div class="rounded-md bg-red-50 p-3 text-sm text-red-800">
								Invalid or missing reset token. Please request a new password reset link.
							</div>
						{/if}
						<Field>
							<FieldLabel for="new-password">New Password</FieldLabel>
							<Input
								id="new-password"
								type="password"
								placeholder="Enter new password"
								required
								bind:value={newPassword}
								disabled={resetMutation.isPending || !token}
							/>
						</Field>
						<Field>
							<FieldLabel for="confirm-password">Confirm Password</FieldLabel>
							<Input
								id="confirm-password"
								type="password"
								placeholder="Confirm new password"
								required
								bind:value={confirmPassword}
								disabled={resetMutation.isPending || !token}
							/>
						</Field>
						<Field>
							<Button type="submit" class="w-full" disabled={resetMutation.isPending || !token}>
								{resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
							</Button>
							<FieldDescription class="text-center">
								Remember your password? <a href={resolve('/login')} data-sveltekit-reload="off"
									>Back to login</a
								>
							</FieldDescription>
						</Field>
					</FieldGroup>
				</form>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
