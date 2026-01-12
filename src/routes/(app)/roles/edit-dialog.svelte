<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { updateRoleFormSchema, type UpdateRoleFormSchema } from './schema';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { ControlAttrs } from 'formsnap';
	import { useUpdateRole } from '$lib/queries/roles.queries';
	import type { CustomRoleWithPermissions } from '$lib/types/roles';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { Authorize } from '$lib/components/access-control';
	import { SystemPermission } from '$lib/types/permissions';

	let {
		open = $bindable(false),
		role,
		onClose
	}: {
		open: boolean;
		role: CustomRoleWithPermissions | null;
		onClose?: () => void;
	} = $props();

	const updateRole = useUpdateRole();

	const form = superForm(defaults(zod4(updateRoleFormSchema)), {
		validators: zod4Client(updateRoleFormSchema),
		SPA: true,
		onUpdate: ({ form: f }: { form: SuperValidated<Infer<UpdateRoleFormSchema>> }) => {
			if (f.valid && role) {
				updateRole.mutate(
					{
						id: role.id,
						data: {
							name: f.data.name || undefined,
							description: f.data.description || undefined
						}
					},
					{
						onSuccess: () => {
							handleClose();
						},
						onError: (error: Error) => {
							console.error('Failed to update role:', error.message);
						}
					}
				);
			}
		}
	});

	const { form: formData, enhance, reset } = form;

	$effect(() => {
		if (role && open) {
			$formData.name = role.name;
			$formData.description = role.description || '';
		}
	});

	function handleClose() {
		open = false;
		reset();
		onClose?.();
	}
</script>

<Dialog.Root bind:open onOpenChange={(v) => !v && handleClose()}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<PencilIcon class="h-5 w-5" />
				Edit Role
			</Dialog.Title>
			<Dialog.Description>
				{#if role}
					Update the details for <strong>{role.name}</strong>
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<Authorize permission={SystemPermission.ROLES_UPDATE}>
			<form method="POST" use:enhance class="space-y-4 py-4">
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props }: { props: ControlAttrs })}
							<Form.Label>Name</Form.Label>
							<Input {...props} bind:value={$formData.name} placeholder="Enter role name" />
						{/snippet}
					</Form.Control>
					<Form.Description>The name of the role</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="description">
					<Form.Control>
						{#snippet children({ props }: { props: ControlAttrs })}
							<Form.Label>Description</Form.Label>
							<Textarea
								{...props}
								bind:value={$formData.description}
								placeholder="Enter role description"
								rows={3}
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>A brief description of the role (optional)</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Dialog.Footer>
					<Button
						type="button"
						variant="outline"
						onclick={handleClose}
						disabled={updateRole.isPending}
					>
						Cancel
					</Button>
					<Form.Button disabled={updateRole.isPending}>
						{#if updateRole.isPending}
							<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Save Changes
					</Form.Button>
				</Dialog.Footer>
			</form>
			{#snippet fallback()}
				<div class="py-8 text-center">
					<p class="text-muted-foreground">You don't have permission to edit roles.</p>
					<Dialog.Footer class="mt-4">
						<Button variant="outline" onclick={handleClose}>Close</Button>
					</Dialog.Footer>
				</div>
			{/snippet}
		</Authorize>
	</Dialog.Content>
</Dialog.Root>
