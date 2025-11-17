<script lang="ts">
	import { onMount } from 'svelte';
	import { requireAuth } from '$lib/guards/auth.guard';
	import {
		useMFAStatus,
		useEnableMFA,
		useVerifyMFASetup,
		useDisableMFA,
		useRegenerateRecoveryCodes
	} from '$lib/queries/auth.queries';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { FieldGroup, Field, FieldLabel } from '$lib/components/ui/field/index.js';
	import { goto } from '$app/navigation';

	let showEnableFlow = $state(false);
	let qrCodeUrl = $state('');
	let manualEntryKey = $state('');
	let verificationCode = $state('');
	let recoveryCodes = $state<string[]>([]);
	let showRecoveryCodes = $state(false);

	let showDisableFlow = $state(false);
	let disablePassword = $state('');

	let showRegenerateFlow = $state(false);

	const mfaStatusQuery = useMFAStatus();
	const enableMFAMutation = useEnableMFA();
	const verifyMFASetupMutation = useVerifyMFASetup();
	const disableMFAMutation = useDisableMFA();
	const regenerateCodesMutation = useRegenerateRecoveryCodes();

	onMount(() => {
		requireAuth();
	});

	function handleEnableMFA() {
		$enableMFAMutation.mutate(undefined, {
			onSuccess: (response) => {
				qrCodeUrl = response.qr_code_url;
				manualEntryKey = response.manual_entry_key;
				showEnableFlow = true;
			}
		});
	}

	function handleVerifySetup(e: Event) {
		e.preventDefault();
		$verifyMFASetupMutation.mutate(
			{ code: verificationCode },
			{
				onSuccess: (response) => {
					recoveryCodes = response.recovery_codes;
					showRecoveryCodes = true;
					showEnableFlow = false;
					$mfaStatusQuery.refetch();
				}
			}
		);
	}

	function handleDisableMFA(e: Event) {
		e.preventDefault();
		$disableMFAMutation.mutate(
			{ password: disablePassword },
			{
				onSuccess: () => {
					showDisableFlow = false;
					disablePassword = '';
					$mfaStatusQuery.refetch();
				}
			}
		);
	}

	function handleRegenerateCodes() {
		$regenerateCodesMutation.mutate(undefined, {
			onSuccess: (response) => {
				recoveryCodes = response.recovery_codes;
				showRecoveryCodes = true;
				showRegenerateFlow = false;
			}
		});
	}

	function cancelEnableFlow() {
		showEnableFlow = false;
		qrCodeUrl = '';
		manualEntryKey = '';
		verificationCode = '';
		$enableMFAMutation.reset();
	}

	function cancelDisableFlow() {
		showDisableFlow = false;
		disablePassword = '';
		$disableMFAMutation.reset();
	}

	function cancelRegenerateFlow() {
		showRegenerateFlow = false;
		$regenerateCodesMutation.reset();
	}

	function closeRecoveryCodes() {
		showRecoveryCodes = false;
		recoveryCodes = [];
	}

	function downloadRecoveryCodes() {
		const content = recoveryCodes.join('\n');
		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'chalkbyte-recovery-codes.txt';
		a.click();
		URL.revokeObjectURL(url);
	}

	async function copyRecoveryCodes() {
		const content = recoveryCodes.join('\n');
		await navigator.clipboard.writeText(content);
	}
</script>

<div class="min-h-svh bg-gray-50 p-6">
	<div class="mx-auto max-w-3xl">
		<div class="mb-8">
			<Button variant="outline" onclick={() => goto('/dashboard')}>← Back to Dashboard</Button>
		</div>

		<h1 class="mb-2 text-3xl font-bold text-gray-900">Multi-Factor Authentication</h1>
		<p class="mb-8 text-gray-600">Secure your account with two-factor authentication</p>

		{#if $enableMFAMutation.isError}
			<div class="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800">
				{$enableMFAMutation.error?.message || 'An error occurred'}
			</div>
		{/if}

		{#if $verifyMFASetupMutation.isError}
			<div class="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800">
				{$verifyMFASetupMutation.error?.message || 'Invalid verification code'}
			</div>
		{/if}

		{#if $disableMFAMutation.isError}
			<div class="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800">
				{$disableMFAMutation.error?.message || 'Failed to disable MFA'}
			</div>
		{/if}

		{#if $regenerateCodesMutation.isError}
			<div class="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800">
				{$regenerateCodesMutation.error?.message || 'Failed to regenerate recovery codes'}
			</div>
		{/if}

		{#if $verifyMFASetupMutation.isSuccess && !showRecoveryCodes}
			<div class="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-800">
				MFA enabled successfully! Please save your recovery codes.
			</div>
		{/if}

		{#if $disableMFAMutation.isSuccess}
			<div class="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-800">
				MFA disabled successfully
			</div>
		{/if}

		{#if $regenerateCodesMutation.isSuccess && !showRecoveryCodes}
			<div class="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-800">
				Recovery codes regenerated successfully! Please save your new codes.
			</div>
		{/if}

		{#if $mfaStatusQuery.isLoading && !showEnableFlow && !showDisableFlow && !showRegenerateFlow}
			<Card.Root>
				<Card.Content class="flex items-center justify-center p-12">
					<p class="text-gray-600">Loading...</p>
				</Card.Content>
			</Card.Root>
		{:else if showRecoveryCodes}
			<Card.Root>
				<Card.Header>
					<Card.Title>Save Your Recovery Codes</Card.Title>
					<Card.Description>
						Store these recovery codes in a safe place. You can use them to access your account if
						you lose access to your authenticator app.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="mb-4 rounded-md bg-gray-100 p-4 font-mono text-sm">
						{#each recoveryCodes as code}
							<div class="py-1">{code}</div>
						{/each}
					</div>
					<div class="flex gap-2">
						<Button onclick={downloadRecoveryCodes} variant="outline">Download</Button>
						<Button onclick={copyRecoveryCodes} variant="outline">Copy</Button>
						<Button onclick={closeRecoveryCodes} class="ml-auto">Done</Button>
					</div>
				</Card.Content>
			</Card.Root>
		{:else if showEnableFlow}
			<Card.Root>
				<Card.Header>
					<Card.Title>Enable Two-Factor Authentication</Card.Title>
					<Card.Description>Scan the QR code with your authenticator app</Card.Description>
				</Card.Header>
				<Card.Content>
					<form onsubmit={handleVerifySetup}>
						<FieldGroup>
							<div class="mb-6 flex justify-center">
								{#if qrCodeUrl}
									<img src={qrCodeUrl} alt="QR Code" class="rounded-lg border" />
								{/if}
							</div>

							{#if manualEntryKey}
								<div class="mb-6 rounded-md bg-gray-50 p-4">
									<p class="mb-2 text-sm font-medium text-gray-700">
										Can't scan the QR code? Enter this key manually:
									</p>
									<p class="font-mono text-sm break-all text-gray-900">{manualEntryKey}</p>
								</div>
							{/if}

							<Field>
								<FieldLabel for="verification-code"
									>Enter verification code from your app</FieldLabel
								>
								<Input
									id="verification-code"
									type="text"
									placeholder="000000"
									required
									maxlength="6"
									bind:value={verificationCode}
									disabled={$verifyMFASetupMutation.isPending}
								/>
							</Field>

							<div class="flex gap-2">
								<Button type="submit" disabled={$verifyMFASetupMutation.isPending}>
									{$verifyMFASetupMutation.isPending ? 'Verifying...' : 'Verify & Enable'}
								</Button>
								<Button type="button" variant="outline" onclick={cancelEnableFlow}>Cancel</Button>
							</div>
						</FieldGroup>
					</form>
				</Card.Content>
			</Card.Root>
		{:else if showDisableFlow}
			<Card.Root>
				<Card.Header>
					<Card.Title>Disable Two-Factor Authentication</Card.Title>
					<Card.Description>Enter your password to confirm</Card.Description>
				</Card.Header>
				<Card.Content>
					<form onsubmit={handleDisableMFA}>
						<FieldGroup>
							<div class="mb-4 rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
								Warning: Disabling MFA will make your account less secure.
							</div>

							<Field>
								<FieldLabel for="disable-password">Password</FieldLabel>
								<Input
									id="disable-password"
									type="password"
									required
									bind:value={disablePassword}
									disabled={$disableMFAMutation.isPending}
								/>
							</Field>

							<div class="flex gap-2">
								<Button
									type="submit"
									variant="destructive"
									disabled={$disableMFAMutation.isPending}
								>
									{$disableMFAMutation.isPending ? 'Disabling...' : 'Disable MFA'}
								</Button>
								<Button type="button" variant="outline" onclick={cancelDisableFlow}>Cancel</Button>
							</div>
						</FieldGroup>
					</form>
				</Card.Content>
			</Card.Root>
		{:else if showRegenerateFlow}
			<Card.Root>
				<Card.Header>
					<Card.Title>Regenerate Recovery Codes</Card.Title>
					<Card.Description>Your old recovery codes will no longer work</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="mb-4 rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
						Warning: This will invalidate all your existing recovery codes.
					</div>
					<div class="flex gap-2">
						<Button onclick={handleRegenerateCodes} disabled={$regenerateCodesMutation.isPending}>
							{$regenerateCodesMutation.isPending ? 'Regenerating...' : 'Regenerate Codes'}
						</Button>
						<Button variant="outline" onclick={cancelRegenerateFlow}>Cancel</Button>
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			<div class="grid gap-6">
				<Card.Root>
					<Card.Header>
						<Card.Title>Status</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium text-gray-900">Two-Factor Authentication</p>
								<p class="text-sm text-gray-600">
									{$mfaStatusQuery.data?.mfa_enabled ? 'Currently enabled' : 'Currently disabled'}
								</p>
							</div>
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full {$mfaStatusQuery.data
									?.mfa_enabled
									? 'bg-green-100'
									: 'bg-gray-100'}"
							>
								{#if $mfaStatusQuery.data?.mfa_enabled}
									<svg
										class="h-6 w-6 text-green-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								{:else}
									<svg
										class="h-6 w-6 text-gray-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								{/if}
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				{#if $mfaStatusQuery.data?.mfa_enabled}
					<Card.Root>
						<Card.Header>
							<Card.Title>Manage MFA</Card.Title>
							<Card.Description>Configure your two-factor authentication settings</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-3">
							<Button onclick={() => (showRegenerateFlow = true)} variant="outline" class="w-full">
								Regenerate Recovery Codes
							</Button>
							<Button onclick={() => (showDisableFlow = true)} variant="destructive" class="w-full">
								Disable MFA
							</Button>
						</Card.Content>
					</Card.Root>
				{:else}
					<Card.Root>
						<Card.Header>
							<Card.Title>Enable MFA</Card.Title>
							<Card.Description
								>Protect your account with an extra layer of security</Card.Description
							>
						</Card.Header>
						<Card.Content>
							<div class="mb-4 space-y-2">
								<p class="text-sm text-gray-700">
									Two-factor authentication adds an extra layer of security to your account by
									requiring both your password and a verification code from your phone.
								</p>
								<p class="text-sm text-gray-700">You'll need:</p>
								<ul class="list-inside list-disc space-y-1 text-sm text-gray-700">
									<li>An authenticator app (Google Authenticator, Authy, etc.)</li>
									<li>Your smartphone or tablet</li>
								</ul>
							</div>
							<Button
								onclick={handleEnableMFA}
								class="w-full"
								disabled={$enableMFAMutation.isPending}
							>
								{$enableMFAMutation.isPending
									? 'Setting up...'
									: 'Enable Two-Factor Authentication'}
							</Button>
						</Card.Content>
					</Card.Root>
				{/if}

				<Card.Root>
					<Card.Header>
						<Card.Title>About Two-Factor Authentication</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4 text-sm text-gray-700">
						<div>
							<h3 class="mb-1 font-medium text-gray-900">What is 2FA?</h3>
							<p>
								Two-factor authentication (2FA) adds an extra layer of security beyond just your
								password. Even if someone knows your password, they won't be able to access your
								account without the second factor.
							</p>
						</div>
						<div>
							<h3 class="mb-1 font-medium text-gray-900">How does it work?</h3>
							<p>
								After entering your password, you'll need to enter a 6-digit code from your
								authenticator app. This code changes every 30 seconds, making it nearly impossible
								for attackers to intercept.
							</p>
						</div>
						<div>
							<h3 class="mb-1 font-medium text-gray-900">Recovery Codes</h3>
							<p>
								When you enable 2FA, you'll receive recovery codes. Store these safely! You can use
								them to access your account if you lose your phone or can't access your
								authenticator app.
							</p>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		{/if}
	</div>
</div>
