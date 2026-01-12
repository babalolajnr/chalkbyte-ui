<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { userFormSchema, type UserFormSchema } from './schema';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { ControlAttrs } from 'formsnap';
	import { useCreateUser } from '$lib/queries/user.queries';
	import { useSchools } from '$lib/queries/school.queries';
	import { useRoles } from '$lib/queries/roles.queries';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CheckIcon from '@lucide/svelte/icons/check';

	let {
		data,
		schoolId,
		onSuccess,
		onCancel
	}: {
		data: SuperValidated<Infer<UserFormSchema>>;
		schoolId?: string;
		onSuccess?: () => void;
		onCancel?: () => void;
	} = $props();

	const createUser = useCreateUser();
	const schools = useSchools({ limit: 100 });
	const roles = useRoles({ limit: 100 });

	let selectedRoles = $state<string[]>([]);
	let selectedSchoolId = $state<string | undefined>(undefined);
	let showPassword = $state(false);

	$effect(() => {
		if (schoolId) {
			selectedSchoolId = schoolId;
		}
	});

	const selectedSchoolName = $derived(
		selectedSchoolId
			? schools.data?.data?.find((s) => s.id === selectedSchoolId)?.name || 'Selected'
			: 'Select school (optional)'
	);

	function toggleRole(roleId: string) {
		if (selectedRoles.includes(roleId)) {
			selectedRoles = selectedRoles.filter((id) => id !== roleId);
		} else {
			selectedRoles = [...selectedRoles, roleId];
		}
	}

	const form = $derived(
		superForm(data, {
			validators: zod4Client(userFormSchema),
			onUpdate: ({ form: f }: { form: SuperValidated<Infer<UserFormSchema>> }) => {
				if (f.valid) {
					createUser.mutate(
						{
							email: f.data.email,
							first_name: f.data.first_name,
							last_name: f.data.last_name,
							password: f.data.password,
							role_ids: selectedRoles.length > 0 ? selectedRoles : undefined,
							school_id: selectedSchoolId || undefined
						},
						{
							onSuccess: () => {
								selectedRoles = [];
								selectedSchoolId = undefined;
								onSuccess?.();
							},
							onError: (error: Error) => {
								console.error('Failed to create user:', error.message);
							}
						}
					);
				}
			}
		})
	);

	const formStore = $derived(form.form);
	const enhance = $derived(form.enhance);
</script>

<form method="POST" use:enhance class="space-y-6">
	<div class="grid gap-4 sm:grid-cols-2">
		<Form.Field {form} name="first_name">
			<Form.Control>
				{#snippet children({ props }: { props: ControlAttrs })}
					<Form.Label>First Name</Form.Label>
					<Input {...props} bind:value={$formStore.first_name} placeholder="Enter first name" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="last_name">
			<Form.Control>
				{#snippet children({ props }: { props: ControlAttrs })}
					<Form.Label>Last Name</Form.Label>
					<Input {...props} bind:value={$formStore.last_name} placeholder="Enter last name" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<Form.Field {form} name="email">
		<Form.Control>
			{#snippet children({ props }: { props: ControlAttrs })}
				<Form.Label>Email</Form.Label>
				<Input
					{...props}
					type="email"
					bind:value={$formStore.email}
					placeholder="Enter email address"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="password">
		<Form.Control>
			{#snippet children({ props }: { props: ControlAttrs })}
				<Form.Label>Password</Form.Label>
				<div class="relative">
					<Input
						{...props}
						type={showPassword ? 'text' : 'password'}
						bind:value={$formStore.password}
						placeholder="Enter password"
						class="pr-10"
					/>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						class="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
						onclick={() => (showPassword = !showPassword)}
					>
						{#if showPassword}
							<EyeOffIcon class="h-4 w-4 text-muted-foreground" />
						{:else}
							<EyeIcon class="h-4 w-4 text-muted-foreground" />
						{/if}
					</Button>
				</div>
			{/snippet}
		</Form.Control>
		<Form.Description>Password must be at least 8 characters</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	{#if !schoolId}
		<div class="space-y-2">
			<span class="text-sm font-medium">School</span>
			{#if schools.isLoading}
				<div class="flex items-center py-2">
					<Loader2Icon class="h-4 w-4 animate-spin text-muted-foreground" />
					<span class="ml-2 text-sm text-muted-foreground">Loading schools...</span>
				</div>
			{:else if schools.data?.data && schools.data.data.length > 0}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline" class="w-full justify-between">
								<span class="truncate">{selectedSchoolName}</span>
								<ChevronDownIcon class="ml-2 h-4 w-4 shrink-0" />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="start" class="max-h-60 w-full min-w-56 overflow-y-auto">
						<DropdownMenu.Item onclick={() => (selectedSchoolId = undefined)}>
							{#if selectedSchoolId === undefined}
								<CheckIcon class="mr-2 h-4 w-4" />
							{:else}
								<span class="mr-2 w-4"></span>
							{/if}
							No school
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						{#each schools.data.data as school (school.id)}
							<DropdownMenu.Item onclick={() => (selectedSchoolId = school.id)}>
								{#if selectedSchoolId === school.id}
									<CheckIcon class="mr-2 h-4 w-4" />
								{:else}
									<span class="mr-2 w-4"></span>
								{/if}
								{school.name}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<p class="text-sm text-muted-foreground">No schools available</p>
			{/if}
		</div>
	{/if}

	<div class="space-y-4">
		<div>
			<h4 class="text-sm font-medium">Roles</h4>
			<p class="text-sm text-muted-foreground">Assign roles to this user (optional)</p>
		</div>

		{#if roles.isLoading}
			<div class="flex items-center justify-center py-4">
				<Loader2Icon class="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		{:else if roles.isError}
			<div class="py-4 text-center text-sm text-destructive">Failed to load roles</div>
		{:else if roles.data?.data && roles.data.data.length > 0}
			<div class="grid grid-cols-1 gap-2 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each roles.data.data as role (role.id)}
					<div class="flex items-center gap-2">
						<Checkbox
							checked={selectedRoles.includes(role.id)}
							onCheckedChange={() => toggleRole(role.id)}
						/>
						<div class="flex flex-col">
							<span class="text-sm font-medium">{role.name}</span>
							{#if role.is_system_role}
								<span class="text-xs text-muted-foreground">System role</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-muted-foreground">No roles available</p>
		{/if}
	</div>

	<div class="flex gap-2">
		<Form.Button disabled={createUser.isPending}>
			{#if createUser.isPending}
				<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			Create User
		</Form.Button>
		<Button type="button" variant="outline" onclick={onCancel}>Cancel</Button>
	</div>
</form>
