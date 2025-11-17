<script lang="ts">
	import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useVerifyMFA, useLoginWithRecoveryCode } from '$lib/queries/auth.queries';
	import { authStore } from '$lib/stores/auth.store';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();

	let otpValue = $state('');
	let tempToken = $state('');
	let showRecoveryCodeInput = $state(false);
	let recoveryCode = $state('');

	const verifyMFAMutation = useVerifyMFA();
	const recoveryCodeMutation = useLoginWithRecoveryCode();

	onMount(() => {
		authStore.subscribe((state) => {
			if (state.tempToken) {
				tempToken = state.tempToken;
			} else if (!state.mfaRequired) {
				goto('/login');
			}
		});
	});

	function handleSubmit(e: Event) {
		e.preventDefault();

		if (showRecoveryCodeInput) {
			$recoveryCodeMutation.mutate({
				recovery_code: recoveryCode,
				temp_token: tempToken
			});
		} else {
			$verifyMFAMutation.mutate({
				code: otpValue,
				temp_token: tempToken
			});
		}
	}

	function handleResend() {
		otpValue = '';
		$verifyMFAMutation.reset();
	}

	function toggleRecoveryCode() {
		showRecoveryCodeInput = !showRecoveryCodeInput;
		otpValue = '';
		recoveryCode = '';
		$verifyMFAMutation.reset();
		$recoveryCodeMutation.reset();
	}

	const isLoading = $derived($verifyMFAMutation.isPending || $recoveryCodeMutation.isPending);
	const error = $derived(
		$verifyMFAMutation.error?.message || $recoveryCodeMutation.error?.message || ''
	);
</script>

<div class={cn('flex flex-col gap-6', className)} {...restProps}>
	<form onsubmit={handleSubmit}>
		<Field.Group>
			<div class="flex flex-col items-center gap-2 text-center">
				<a href="/" class="flex flex-col items-center gap-2 font-medium">
					<div class="flex size-8 items-center justify-center rounded-md">
						<GalleryVerticalEndIcon class="size-6" />
					</div>
					<span class="sr-only">Chalkbyte</span>
				</a>
				<h1 class="text-xl font-bold">
					{showRecoveryCodeInput ? 'Enter recovery code' : 'Enter verification code'}
				</h1>
				<Field.Description>
					{showRecoveryCodeInput
						? 'Enter one of your recovery codes to complete login'
						: 'We sent a 6-digit code to your authenticator app'}
				</Field.Description>
			</div>

			{#if error}
				<div class="rounded-md bg-red-50 p-3 text-sm text-red-800">
					{error}
				</div>
			{/if}

			{#if showRecoveryCodeInput}
				<Field.Field>
					<Field.Label for="recovery-code">Recovery Code</Field.Label>
					<input
						id="recovery-code"
						type="text"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="Enter recovery code"
						required
						bind:value={recoveryCode}
						disabled={isLoading}
					/>
				</Field.Field>
			{:else}
				<Field.Field>
					<Field.Label for="otp" class="sr-only">Verification code</Field.Label>
					<InputOTP.Root
						maxlength={6}
						id="otp"
						required
						class="gap-4"
						bind:value={otpValue}
						disabled={isLoading}
					>
						{#snippet children({ cells })}
							<InputOTP.Group
								class="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl"
							>
								{#each cells.slice(0, 3) as cell (cell)}
									<InputOTP.Slot {cell} />
								{/each}
							</InputOTP.Group>
							<InputOTP.Separator />
							<InputOTP.Group
								class="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl"
							>
								{#each cells.slice(3, 6) as cell (cell)}
									<InputOTP.Slot {cell} />
								{/each}
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
					<Field.Description class="text-center">
						Didn't receive the code? <button
							type="button"
							onclick={handleResend}
							class="underline"
							disabled={isLoading}>Resend</button
						>
					</Field.Description>
				</Field.Field>
			{/if}

			<Field.Field>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? 'Verifying...' : 'Verify'}
				</Button>
				<Button type="button" variant="outline" onclick={toggleRecoveryCode} disabled={isLoading}>
					{showRecoveryCodeInput ? 'Use verification code' : 'Use recovery code'}
				</Button>
			</Field.Field>
		</Field.Group>
	</form>
	<Field.Description class="px-6 text-center">
		By clicking continue, you agree to our <a href="/terms">Terms of Service</a>
		and <a href="/privacy">Privacy Policy</a>.
	</Field.Description>
</div>
