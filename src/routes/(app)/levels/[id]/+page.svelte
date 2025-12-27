<script lang="ts">
	import { page } from '$app/stores';
	import {
		useLevel,
		useLevelStudents,
		useUpdateLevel,
		useRemoveStudentFromLevel
	} from '$lib/queries/level.queries';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import UsersIcon from '@lucide/svelte/icons/users';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import UserMinusIcon from '@lucide/svelte/icons/user-minus';
	import type { LevelStudent } from '$lib/types/level';

	const levelId = $derived($page.params.id || '');

	let activeTab = $state<'info' | 'students'>('info');
	let showEditDialog = $state(false);
	let editName = $state('');
	let editDescription = $state('');

	const level = $derived(useLevel(levelId));
	const students = $derived(useLevelStudents(levelId));
	const updateLevel = useUpdateLevel();
	const removeStudent = useRemoveStudentFromLevel();

	$effect(() => {
		if (level.data) {
			editName = level.data.name;
			editDescription = level.data.description || '';
		}
	});

	function openEditDialog() {
		if (level.data) {
			editName = level.data.name;
			editDescription = level.data.description || '';
		}
		showEditDialog = true;
	}

	function handleUpdateLevel() {
		updateLevel.mutate(
			{
				id: levelId,
				data: {
					name: editName,
					description: editDescription || undefined
				}
			},
			{
				onSuccess: () => {
					showEditDialog = false;
				}
			}
		);
	}

	function handleRemoveStudent(student: LevelStudent) {
		if (
			confirm(
				`Are you sure you want to remove "${student.first_name} ${student.last_name}" from this level?`
			)
		) {
			removeStudent.mutate(student.id);
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<div class="mb-1">
				<Button variant="ghost" href="/levels" class="mb-2 -ml-4">
					<ChevronLeftIcon class="mr-1 h-4 w-4" />
					Back to Levels
				</Button>
			</div>
			{#if level.isLoading}
				<Skeleton class="mb-2 h-8 w-64" />
				<Skeleton class="h-4 w-48" />
			{:else if level.data}
				<h1 class="text-3xl font-bold tracking-tight">{level.data.name}</h1>
				{#if level.data.description}
					<p class="text-muted-foreground">{level.data.description}</p>
				{/if}
			{/if}
		</div>
		<div class="flex gap-2">
			{#if level.data}
				<Button variant="outline" onclick={openEditDialog}>
					<PencilIcon class="mr-2 h-4 w-4" />
					Edit
				</Button>
			{/if}
		</div>
	</div>

	{#if level.isLoading}
		<div class="grid gap-4 md:grid-cols-2">
			<Card.Root>
				<Card.Content class="pt-6">
					<Skeleton class="h-20 w-full" />
				</Card.Content>
			</Card.Root>
		</div>
	{:else if level.isError}
		<Card.Root>
			<Card.Content class="pt-6">
				<div class="py-8 text-center text-destructive">
					<p>Error loading level information</p>
					<p class="text-sm">{level.error?.message}</p>
				</div>
			</Card.Content>
		</Card.Root>
	{:else if level.data}
		<div class="grid gap-4 md:grid-cols-2">
			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-muted-foreground">Total Students</p>
							<p class="text-3xl font-bold">{level.data.student_count}</p>
						</div>
						<div class="rounded-full bg-primary/10 p-3">
							<UsersIcon class="h-6 w-6 text-primary" />
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	<div class="border-b">
		<nav class="-mb-px flex space-x-8">
			<button
				onclick={() => (activeTab = 'info')}
				class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'info'
					? 'border-primary text-primary'
					: 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700'}"
			>
				Information
			</button>
			<button
				onclick={() => (activeTab = 'students')}
				class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'students'
					? 'border-primary text-primary'
					: 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700'}"
			>
				Students ({level.data?.student_count ?? 0})
			</button>
		</nav>
	</div>

	{#if activeTab === 'info'}
		<Card.Root>
			<Card.Header>
				<Card.Title>Level Information</Card.Title>
				<Card.Description>Basic details about the level</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if level.isLoading}
					<div class="space-y-4">
						<Skeleton class="h-6 w-full" />
						<Skeleton class="h-6 w-full" />
						<Skeleton class="h-6 w-3/4" />
					</div>
				{:else if level.data}
					<div class="space-y-4">
						<div class="grid grid-cols-3 gap-4">
							<div class="font-medium text-muted-foreground">Name:</div>
							<div class="col-span-2">{level.data.name}</div>
						</div>
						<div class="grid grid-cols-3 gap-4">
							<div class="font-medium text-muted-foreground">Description:</div>
							<div class="col-span-2">{level.data.description || 'N/A'}</div>
						</div>
						<div class="grid grid-cols-3 gap-4">
							<div class="font-medium text-muted-foreground">Level ID:</div>
							<div class="col-span-2 font-mono text-sm">{level.data.id}</div>
						</div>
						<div class="grid grid-cols-3 gap-4">
							<div class="font-medium text-muted-foreground">School ID:</div>
							<div class="col-span-2 font-mono text-sm">{level.data.school_id}</div>
						</div>
						<div class="grid grid-cols-3 gap-4">
							<div class="font-medium text-muted-foreground">Created:</div>
							<div class="col-span-2">{new Date(level.data.created_at).toLocaleString()}</div>
						</div>
						<div class="grid grid-cols-3 gap-4">
							<div class="font-medium text-muted-foreground">Last Updated:</div>
							<div class="col-span-2">{new Date(level.data.updated_at).toLocaleString()}</div>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{:else if activeTab === 'students'}
		<Card.Root>
			<Card.Header>
				<Card.Title>Students</Card.Title>
				<Card.Description>List of all students assigned to this level</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if students.isLoading}
					<div class="flex items-center justify-center py-8">
						<Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				{:else if students.isError}
					<div class="py-8 text-center text-destructive">
						<p>Error loading students</p>
						<p class="text-sm">{students.error?.message}</p>
					</div>
				{:else if students.data}
					{#if students.data.length === 0}
						<div class="py-8 text-center text-muted-foreground">
							<UsersIcon class="mx-auto mb-2 h-12 w-12 opacity-20" />
							<p>No students assigned to this level</p>
						</div>
					{:else}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Name</Table.Head>
									<Table.Head>Email</Table.Head>
									<Table.Head>Role</Table.Head>
									<Table.Head class="w-[100px]">Actions</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each students.data as student (student.id)}
									<Table.Row>
										<Table.Cell class="font-medium">
											{student.first_name}
											{student.last_name}
										</Table.Cell>
										<Table.Cell>{student.email}</Table.Cell>
										<Table.Cell class="capitalize">{student.role}</Table.Cell>
										<Table.Cell>
											<Button
												variant="ghost"
												size="sm"
												class="text-destructive hover:text-destructive"
												onclick={() => handleRemoveStudent(student)}
												disabled={removeStudent.isPending}
											>
												{#if removeStudent.isPending}
													<Loader2Icon class="h-4 w-4 animate-spin" />
												{:else}
													<UserMinusIcon class="h-4 w-4" />
												{/if}
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
						<div class="mt-4 text-sm text-muted-foreground">
							Showing {students.data.length} student(s)
						</div>
					{/if}
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<Dialog.Root bind:open={showEditDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit Level</Dialog.Title>
			<Dialog.Description>Update the level details</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="name">Name</Label>
				<Input id="name" bind:value={editName} placeholder="Enter level name" />
			</div>
			<div class="grid gap-2">
				<Label for="description">Description</Label>
				<Textarea
					id="description"
					bind:value={editDescription}
					placeholder="Enter level description"
					rows={3}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showEditDialog = false)}>Cancel</Button>
			<Button onclick={handleUpdateLevel} disabled={updateLevel.isPending || !editName.trim()}>
				{#if updateLevel.isPending}
					<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Save Changes
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
