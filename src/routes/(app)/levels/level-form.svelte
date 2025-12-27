<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { levelFormSchema, type LevelFormSchema } from './schema';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { ControlAttrs } from 'formsnap';
	import { useCreateLevel } from '$lib/queries/level.queries';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';

	let {
		data,
		onSuccess,
		onCancel
	}: {
		data: SuperValidated<Infer<LevelFormSchema>>;
		onSuccess?: () => void;
		onCancel?: () => void;
	} = $props();

	const createLevel = useCreateLevel();

	const form = superForm(data, {
		validators: zod4Client(levelFormSchema),
		onUpdate: ({ form: f }: { form: SuperValidated<Infer<LevelFormSchema>> }) => {
			if (f.valid) {
				createLevel.mutate(
					{
						name: f.data.name,
						description: f.data.description || undefined
					},
					{
						onSuccess: () => {
							onSuccess?.();
						},
						onError: (error: Error) => {
							console.error('Failed to create level:', error.message);
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
				<Input {...props} bind:value={$formData.name} placeholder="Enter level name" />
			{/snippet}
		</Form.Control>
		<Form.Description>The name of the level (required, max 100 characters)</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="description">
		<Form.Control>
			{#snippet children({ props }: { props: ControlAttrs })}
				<Form.Label>Description</Form.Label>
				<Textarea
					{...props}
					bind:value={$formData.description}
					placeholder="Enter level description"
					rows={3}
				/>
			{/snippet}
		</Form.Control>
		<Form.Description>A brief description of the level (optional)</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<div class="flex gap-2">
		<Form.Button disabled={createLevel.isPending}>
			{#if createLevel.isPending}
				<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			Create Level
		</Form.Button>
		<Button type="button" variant="outline" onclick={onCancel}>Cancel</Button>
	</div>
</form>
