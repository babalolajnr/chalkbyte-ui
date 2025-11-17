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
	import { useRequestPasswordReset } from '$lib/queries/auth.queries';
	import { resolve } from '$app/paths';

	let email = $state('');

	const resetMutation = useRequestPasswordReset();

	function handleSubmit(e: Event) {
		e.preventDefault();
		resetMutation.mutate({ email });
	}
</script>

<div class="flex min-h-svh w-full items-center justify-center px-4">
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Reset Password</Card.Title>
			<Card.Description>
				{#if resetMutation.isSuccess}
					{resetMutation.data?.message || 'Check your email for a password reset link'}
				{:else}
					Enter your email address and we'll send you a password reset link
				{/if}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if resetMutation.isSuccess}
				<div class="space-y-4">
					<div class="rounded-md bg-green-50 p-3 text-sm text-green-800">
						{resetMutation.data?.message ||
							'Password reset email sent successfully. Please check your inbox.'}
					</div>
					<a href={resolve('/login')} class="block" data-sveltekit-reload="off">
						<Button class="w-full">Back to Login</Button>
					</a>
				</div>
			{:else}
				<form onsubmit={handleSubmit}>
					<FieldGroup>
						{#if resetMutation.isError}
							<div class="rounded-md bg-red-50 p-3 text-sm text-red-800">
								{resetMutation.error?.message || 'Failed to send reset email. Please try again.'}
							</div>
						{/if}
						<Field>
							<FieldLabel for="email">Email</FieldLabel>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								required
								bind:value={email}
								disabled={resetMutation.isPending}
							/>
						</Field>
						<Field>
							<Button type="submit" class="w-full" disabled={resetMutation.isPending}>
								{resetMutation.isPending ? 'Sending...' : 'Send Reset Link'}
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
