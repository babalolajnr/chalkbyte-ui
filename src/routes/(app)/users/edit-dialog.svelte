<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { updateUserFormSchema, type UpdateUserFormSchema } from './schema';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4Client, zod4 } from 'sveltekit-superforms/adapters';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { ControlAttrs } from 'formsnap';
	import { useUpdateUser } from '$lib/queries/user.queries';
	import { useSchools } from '$lib/queries/school.queries';
	import type { User } from '$lib/types/user';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CheckIcon from '@lucide/svelte/icons/check';
	import LockIcon from '@lucide/svelte/icons/lock';
	import { Authorize } from '$lib/components/access-control';
	import { SystemPermission } from '$lib/types/permissions';
	import { Users } from '$lib/authorization';

	let {
		open = $bindable(false),
		user,
		onClose
	}: {
		open: boolean;
		user: User | null;
		onClose?: () => void;
	} = $props();

	const updateUser = useUpdateUser();
	const schools = useSchools({ limit: 100 });

	let selectedSchoolId = $state<string | undefined>(undefined);

	const canUpdate = $derived(Users.canUpdate());

	const selectedSchoolName = $derived(
		selectedSchoolId
			? schools.data?.data?.find((s) => s.id === selectedSchoolId)?.name || 'Selected'
			: 'No school assigned'
	);

	const form = superForm(defaults(zod4(updateUserFormSchema)), {
		validators: zod4Client(updateUserFormSchema),
		SPA: true,
		onUpdate: ({ form: f }: { form: SuperValidated<Infer<UpdateUserFormSchema>> }) => {
			if (f.valid && user && canUpdate) {
				updateUser.mutate(
					{
						id: user.id,
						data: {
							email: f.data.email || undefined,
							first_name: f.data.first_name || undefined,
							last_name: f.data.last_name || undefined,
							school_id: selectedSchoolId || null,
							level_id: f.data.level_id || null,
							branch_id: f.data.branch_id || null,
							date_of_birth: f.data.date_of_birth || null,
							grade_level: f.data.grade_level || null
						}
					},
					{
						onSuccess: () => {
							handleClose();
						},
						onError: (error: Error) => {
							console.error('Failed to update user:', error.message);
						}
					}
				);
			}
		}
	});

	const { form: formData, enhance, reset } = form;

	$effect(() => {
		if (user && open) {
			$formData.email = user.email;
			$formData.first_name = user.first_name;
			$formData.last_name = user.last_name;
			$formData.date_of_birth = user.date_of_birth || '';
			$formData.grade_level = user.grade_level || '';
			selectedSchoolId = user.school?.id || undefined;
		}
	});

	function handleClose() {
		open = false;
		reset();
		selectedSchoolId = undefined;
		onClose?.();
	}
</script>

<Dialog.Root bind:open onOpenChange={(v) => !v && handleClose()}>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<PencilIcon class="h-5 w-5" />
				Edit User
			</Dialog.Title>
			<Dialog.Description>
				{#if user}
					Update details for <strong>{user.first_name} {user.last_name}</strong>
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<Authorize permission={SystemPermission.USERS_UPDATE}>
			<form method="POST" use:enhance class="space-y-4 py-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<Form.Field {form} name="first_name">
						<Form.Control>
							{#snippet children({ props }: { props: ControlAttrs })}
								<Form.Label>First Name</Form.Label>
								<Input
									{...props}
									bind:value={$formData.first_name}
									placeholder="Enter first name"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="last_name">
						<Form.Control>
							{#snippet children({ props }: { props: ControlAttrs })}
								<Form.Label>Last Name</Form.Label>
								<Input {...props} bind:value={$formData.last_name} placeholder="Enter last name" />
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
								bind:value={$formData.email}
								placeholder="Enter email address"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

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

				<div class="grid gap-4 sm:grid-cols-2">
					<Form.Field {form} name="date_of_birth">
						<Form.Control>
							{#snippet children({ props }: { props: ControlAttrs })}
								<Form.Label>Date of Birth</Form.Label>
								<Input {...props} type="date" bind:value={$formData.date_of_birth} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="grade_level">
						<Form.Control>
							{#snippet children({ props }: { props: ControlAttrs })}
								<Form.Label>Grade Level</Form.Label>
								<Input {...props} bind:value={$formData.grade_level} placeholder="e.g., Grade 10" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<Dialog.Footer>
					<Button
						type="button"
						variant="outline"
						onclick={handleClose}
						disabled={updateUser.isPending}
					>
						Cancel
					</Button>
					<Form.Button disabled={updateUser.isPending}>
						{#if updateUser.isPending}
							<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Save Changes
					</Form.Button>
				</Dialog.Footer>
			</form>
			{#snippet fallback()}
				<div class="flex flex-col items-center justify-center gap-4 py-8">
					<LockIcon class="h-12 w-12 text-muted-foreground" />
					<p class="text-center text-muted-foreground">You don't have permission to edit users.</p>
					<Button variant="outline" onclick={handleClose}>Close</Button>
				</div>
			{/snippet}
		</Authorize>
	</Dialog.Content>
</Dialog.Root>
