<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { schoolFormSchema, type SchoolFormSchema } from './schema';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { ControlAttrs } from 'formsnap';
	import { useCreateSchool } from '$lib/queries/school.queries';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';

	let {
		data,
		onSuccess,
		onCancel
	}: {
		data: SuperValidated<Infer<SchoolFormSchema>>;
		onSuccess?: () => void;
		onCancel?: () => void;
	} = $props();

	const createSchool = useCreateSchool();

	const form = superForm(data, {
		validators: zod4Client(schoolFormSchema),
		onUpdate: ({ form: f }: { form: SuperValidated<Infer<SchoolFormSchema>> }) => {
			if (f.valid) {
				createSchool.mutate(
					{
						name: f.data.name,
						address: f.data.address || null
					},
					{
						onSuccess: () => {
							onSuccess?.();
						},
						onError: (error: Error) => {
							console.error('Failed to create school:', error.message);
						}
					}
				);
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props }: { props: ControlAttrs })}
				<Form.Label>Name</Form.Label>
				<Input {...props} bind:value={$formData.name} placeholder="Enter school name" />
			{/snippet}
		</Form.Control>
		<Form.Description>The name of the school (required)</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="address">
		<Form.Control>
			{#snippet children({ props }: { props: ControlAttrs })}
				<Form.Label>Address</Form.Label>
				<Input {...props} bind:value={$formData.address} placeholder="Enter school address" />
			{/snippet}
		</Form.Control>
		<Form.Description>The physical address of the school (optional)</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<div class="flex gap-2">
		<Form.Button disabled={createSchool.isPending}>
			{#if createSchool.isPending}
				<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			Create School
		</Form.Button>
		<Button type="button" variant="outline" onclick={onCancel}>Cancel</Button>
	</div>
</form>
