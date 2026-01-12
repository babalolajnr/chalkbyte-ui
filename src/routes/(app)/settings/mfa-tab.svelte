<script lang="ts">
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { mfaService } from '$lib/services/mfa.service';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';

	const queryClient = useQueryClient();

	const mfaStatusQuery = createQuery(() => ({
		queryKey: ['mfa-status'],
		queryFn: () => mfaService.getMFAStatus()
	}));

	let mfaSetupCode = $state('');
	let mfaDisablePassword = $state('');
	let mfaSetupData = $state<{
		qr_code_url: string;
		qr_code_base64: string;
		secret: string;
		manual_entry_key: string;
	} | null>(null);
	let recoveryCodes = $state<string[]>([]);
	let showRecoveryCodes = $state(false);
	let showRegenerateDialog = $state(false);

	const enableMfaMutation = createMutation(() => ({
		mutationFn: () => mfaService.enableMFA(),
		onSuccess: (data) => {
			mfaSetupData = data;
		},
		onError: (error: Error) => {
			toast.error('Failed to enable MFA', {
				description: error.message
			});
		}
	}));

	const verifyMfaSetupMutation = createMutation(() => ({
		mutationFn: (code: string) => mfaService.verifyMFASetup({ code }),
		onSuccess: (data) => {
			recoveryCodes = data.recovery_codes;
			showRecoveryCodes = true;
			mfaSetupData = null;
			mfaSetupCode = '';
			queryClient.invalidateQueries({ queryKey: ['mfa-status'] });
			toast.success('MFA enabled successfully!', {
				description: 'Please save your recovery codes.'
			});
		},
		onError: (error: Error) => {
			toast.error('Failed to verify MFA code', {
				description: error.message
			});
		}
	}));

	const disableMfaMutation = createMutation(() => ({
		mutationFn: (password: string) => mfaService.disableMFA({ password }),
		onSuccess: () => {
			mfaDisablePassword = '';
			queryClient.invalidateQueries({ queryKey: ['mfa-status'] });
			toast.success('MFA disabled successfully');
		},
		onError: (error: Error) => {
			toast.error('Failed to disable MFA', {
				description: error.message
			});
		}
	}));

	const regenerateCodesMutation = createMutation(() => ({
		mutationFn: () => mfaService.regenerateRecoveryCodes(),
		onSuccess: (data) => {
			recoveryCodes = data.recovery_codes;
			showRecoveryCodes = true;
			toast.success('Recovery codes regenerated successfully', {
				description: 'Please save your new recovery codes.'
			});
		},
		onError: (error: Error) => {
			toast.error('Failed to regenerate recovery codes', {
				description: error.message
			});
		}
	}));

	function handleEnableMfa() {
		enableMfaMutation.mutate();
	}

	function handleVerifyMfaSetup() {
		if (!mfaSetupCode || mfaSetupCode.length !== 6) {
			toast.error('Validation error', {
				description: 'Please enter a valid 6-digit code'
			});
			return;
		}
		verifyMfaSetupMutation.mutate(mfaSetupCode);
	}

	function handleDisableMfa() {
		if (!mfaDisablePassword) {
			toast.error('Validation error', {
				description: 'Please enter your password'
			});
			return;
		}
		disableMfaMutation.mutate(mfaDisablePassword);
	}

	function confirmRegenerateCodes() {
		regenerateCodesMutation.mutate();
		showRegenerateDialog = false;
	}

	function downloadRecoveryCodes() {
		const text = recoveryCodes.join('\n');
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'recovery-codes.txt';
		a.click();
		URL.revokeObjectURL(url);
	}

	function cancelMfaSetup() {
		mfaSetupData = null;
		mfaSetupCode = '';
	}

	function closeRecoveryCodes() {
		showRecoveryCodes = false;
		recoveryCodes = [];
	}
</script>

{#if mfaStatusQuery.isLoading}
	<Card.Root>
		<Card.Content class="pt-6">
			<p class="text-muted-foreground">Loading MFA status...</p>
		</Card.Content>
	</Card.Root>
{:else if mfaStatusQuery.error}
	<Card.Root>
		<Card.Content class="pt-6">
			<p class="text-destructive">Error loading MFA status: {mfaStatusQuery.error.message}</p>
		</Card.Content>
	</Card.Root>
{:else if mfaStatusQuery.data}
	{#if !mfaStatusQuery.data.mfa_enabled}
		<Card.Root>
			<Card.Header>
				<Card.Title>Enable Two-Factor Authentication</Card.Title>
				<Card.Description>
					Add an extra layer of security to your account by requiring a verification code in
					addition to your password
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				{#if !mfaSetupData}
					<div class="rounded-lg border border-dashed p-4">
						<div class="flex items-start gap-4">
							<ShieldIcon class="mt-1 h-6 w-6 text-primary" />
							<div class="space-y-2">
								<p class="font-medium">Why enable 2FA?</p>
								<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
									<li>Protect your account from unauthorized access</li>
									<li>Receive alerts about suspicious login attempts</li>
									<li>Meet security compliance requirements</li>
								</ul>
							</div>
						</div>
					</div>
				{:else}
					<div class="space-y-4">
						<div class="space-y-2">
							<p class="font-medium">Step 1: Scan QR Code</p>
							<p class="text-sm text-muted-foreground">
								Scan this QR code with your authenticator app (Google Authenticator, Authy,
								etc.)
							</p>
							<div class="flex justify-center rounded-lg border bg-muted p-4">
								<img
									src={`data:image/png;base64,${mfaSetupData.qr_code_base64}`}
									alt="MFA QR Code"
									class="h-48 w-48"
								/>
							</div>
						</div>
						<Separator />
						<div class="space-y-2">
							<p class="font-medium">Step 2: Enter Manual Key (Optional)</p>
							<p class="text-sm text-muted-foreground">
								If you can't scan the QR code, enter this key manually:
							</p>
							<code class="block rounded bg-muted p-2 font-mono text-sm break-all">
								{mfaSetupData.manual_entry_key}
							</code>
						</div>
						<Separator />
						<div class="space-y-2">
							<p class="font-medium">Step 3: Verify Code</p>
							<p class="text-sm text-muted-foreground">
								Enter the 6-digit code from your authenticator app
							</p>
							<div class="flex gap-2">
								<Input
									type="text"
									placeholder="000000"
									maxlength={6}
									bind:value={mfaSetupCode}
									disabled={verifyMfaSetupMutation.isPending}
									class="font-mono"
								/>
							</div>
						</div>
					</div>
				{/if}
			</Card.Content>
			<Card.Footer class="flex gap-2">
				{#if !mfaSetupData}
					<Button onclick={handleEnableMfa} disabled={enableMfaMutation.isPending}>
						{enableMfaMutation.isPending ? 'Setting up...' : 'Set Up 2FA'}
					</Button>
				{:else}
					<Button
						onclick={handleVerifyMfaSetup}
						disabled={verifyMfaSetupMutation.isPending || mfaSetupCode.length !== 6}
					>
						{verifyMfaSetupMutation.isPending ? 'Verifying...' : 'Verify & Enable'}
					</Button>
					<Button
						variant="outline"
						onclick={cancelMfaSetup}
						disabled={verifyMfaSetupMutation.isPending}
					>
						Cancel
					</Button>
				{/if}
			</Card.Footer>
		</Card.Root>
	{:else}
		<Card.Root>
			<Card.Header>
				<Card.Title>Two-Factor Authentication Enabled</Card.Title>
				<Card.Description>
					Your account is protected with two-factor authentication
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div
					class="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950"
				>
					<div class="flex items-center gap-2">
						<ShieldIcon class="h-5 w-5 text-green-600 dark:text-green-400" />
						<p class="font-medium text-green-900 dark:text-green-100">
							2FA is currently active
						</p>
					</div>
				</div>
				<Separator />
				<div class="space-y-2">
					<p class="font-medium">Recovery Codes</p>
					<p class="text-sm text-muted-foreground">
						Use recovery codes to access your account if you lose your authenticator device
					</p>
					<AlertDialog.Root bind:open={showRegenerateDialog}>
						<AlertDialog.Trigger>
							{#snippet child({ props })}
								<Button
									{...props}
									variant="outline"
									disabled={regenerateCodesMutation.isPending}
								>
									<RefreshCwIcon class="mr-2 h-4 w-4" />
									{regenerateCodesMutation.isPending
										? 'Generating...'
										: 'Regenerate Recovery Codes'}
								</Button>
							{/snippet}
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Regenerate Recovery Codes?</AlertDialog.Title>
								<AlertDialog.Description>
									Are you sure you want to regenerate recovery codes? Old codes will no longer
									work.
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
								<AlertDialog.Action onclick={confirmRegenerateCodes}>
									Regenerate
								</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</div>
				<Separator />
				<div class="space-y-2">
					<p class="font-medium">Disable Two-Factor Authentication</p>
					<p class="text-sm text-muted-foreground">Enter your password to disable 2FA</p>
					<div class="flex gap-2">
						<Input
							type="password"
							placeholder="Enter password"
							bind:value={mfaDisablePassword}
							disabled={disableMfaMutation.isPending}
						/>
						<Button
							variant="destructive"
							onclick={handleDisableMfa}
							disabled={disableMfaMutation.isPending || !mfaDisablePassword}
						>
							{disableMfaMutation.isPending ? 'Disabling...' : 'Disable 2FA'}
						</Button>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
{/if}

{#if showRecoveryCodes}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<Card.Root class="max-w-lg">
			<Card.Header>
				<Card.Title>Save Your Recovery Codes</Card.Title>
				<Card.Description>
					Store these codes in a safe place. Each code can only be used once.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="rounded-lg border bg-muted p-4">
					<div class="grid grid-cols-2 gap-2 font-mono text-sm">
						{#each recoveryCodes as code, i (i)}
							<div class="rounded bg-background p-2 text-center">
								{code}
							</div>
						{/each}
					</div>
				</div>
				<Alert.Root variant="destructive">
					<TriangleAlertIcon />
					<Alert.Description>
						Warning: Save these codes now. You won't be able to see them again.
					</Alert.Description>
				</Alert.Root>
			</Card.Content>
			<Card.Footer class="flex gap-2">
				<Button onclick={downloadRecoveryCodes}>
					<DownloadIcon class="mr-2 h-4 w-4" />
					Download Codes
				</Button>
				<Button variant="outline" onclick={closeRecoveryCodes}>I've Saved My Codes</Button>
			</Card.Footer>
		</Card.Root>
	</div>
{/if}
