<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Input } from '$lib/components/ui/input';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';
	import FilterIcon from '@lucide/svelte/icons/filter';
	import type { UserQueryParams, PaginatedUsersResponse } from '$lib/types/school';
	import { Authorize } from '$lib/components/access-control';
	import { SystemPermission } from '$lib/types/permissions';
	import type { CreateQueryResult } from '@tanstack/svelte-query';

	interface Props {
		students: CreateQueryResult<PaginatedUsersResponse, Error>;
		studentParams: UserQueryParams;
		onParamsChange: (params: UserQueryParams) => void;
	}

	let { students, studentParams, onParamsChange }: Props = $props();

	let showFilters = $state(false);
	let firstNameFilter = $state('');
	let lastNameFilter = $state('');
	let emailFilter = $state('');

	function applyFilters() {
		onParamsChange({
			limit: 10,
			offset: 0,
			first_name: firstNameFilter || undefined,
			last_name: lastNameFilter || undefined,
			email: emailFilter || undefined
		});
	}

	function clearFilters() {
		firstNameFilter = '';
		lastNameFilter = '';
		emailFilter = '';
		onParamsChange({
			limit: 10,
			offset: 0
		});
	}

	function handlePageChange(direction: 'prev' | 'next') {
		if (!students.data) return;
		const totalPages = Math.ceil(students.data.meta.total / studentParams.limit!);
		const currentPage = Math.floor(studentParams.offset! / studentParams.limit!) + 1;

		if (direction === 'prev' && currentPage > 1) {
			onParamsChange({ ...studentParams, offset: studentParams.offset! - studentParams.limit! });
		} else if (direction === 'next' && currentPage < totalPages) {
			onParamsChange({ ...studentParams, offset: studentParams.offset! + studentParams.limit! });
		}
	}
</script>

<Authorize permission={SystemPermission.STUDENTS_READ}>
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title>Students</Card.Title>
					<Card.Description>Students enrolled in your school</Card.Description>
				</div>
				<Button variant="outline" size="sm" onclick={() => (showFilters = !showFilters)}>
					<FilterIcon class="mr-1 h-4 w-4" />
					Filters
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			{#if showFilters}
				<div class="mb-4 flex flex-wrap gap-2 rounded-lg border bg-muted/50 p-4">
					<div class="min-w-50 flex-1">
						<Input placeholder="First name..." bind:value={firstNameFilter} class="h-9" />
					</div>
					<div class="min-w-50 flex-1">
						<Input placeholder="Last name..." bind:value={lastNameFilter} class="h-9" />
					</div>
					<div class="min-w-50 flex-1">
						<Input placeholder="Email..." bind:value={emailFilter} class="h-9" />
					</div>
					<div class="flex gap-2">
						<Button onclick={applyFilters} size="sm">
							<SearchIcon class="mr-1 h-4 w-4" />
							Search
						</Button>
						<Button
							onclick={clearFilters}
							variant="outline"
							size="sm"
							disabled={!firstNameFilter && !lastNameFilter && !emailFilter}
						>
							<XIcon class="mr-1 h-4 w-4" />
							Clear
						</Button>
					</div>
				</div>
			{/if}
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
				{#if students.data.data.length === 0}
					<div class="py-8 text-center text-muted-foreground">
						<GraduationCapIcon class="mx-auto mb-2 h-12 w-12 opacity-20" />
						<p>No students found</p>
					</div>
				{:else}
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Name</Table.Head>
								<Table.Head>Email</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each students.data.data as student (student.id)}
								<Table.Row>
									<Table.Cell class="font-medium"
										>{student.first_name} {student.last_name}</Table.Cell
									>
									<Table.Cell>{student.email}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
					<div class="mt-4 flex items-center justify-between">
						<div class="text-sm text-muted-foreground">
							Showing {studentParams.offset! + 1} to {Math.min(
								studentParams.offset! + studentParams.limit!,
								students.data.meta.total
							)} of {students.data.meta.total} students
						</div>
						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={() => handlePageChange('prev')}
								disabled={studentParams.offset === 0}
							>
								<ChevronLeftIcon class="h-4 w-4" />
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onclick={() => handlePageChange('next')}
								disabled={studentParams.offset! + studentParams.limit! >= students.data.meta.total}
							>
								Next
								<ChevronRightIcon class="h-4 w-4" />
							</Button>
						</div>
					</div>
				{/if}
			{/if}
		</Card.Content>
	</Card.Root>
	{#snippet fallback()}
		<Card.Root>
			<Card.Content class="py-8">
				<p class="text-center text-muted-foreground">
					You don't have permission to view students.
				</p>
			</Card.Content>
		</Card.Root>
	{/snippet}
</Authorize>
