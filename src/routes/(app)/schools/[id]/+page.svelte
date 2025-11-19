<script lang="ts">
	import { page } from '$app/stores';
	import {
		useSchoolFullInfo,
		useSchoolStudents,
		useSchoolAdmins
	} from '$lib/queries/school.queries';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import UsersIcon from '@lucide/svelte/icons/users';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import UserCogIcon from '@lucide/svelte/icons/user-cog';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';
	import FilterIcon from '@lucide/svelte/icons/filter';
	import type { UserQueryParams } from '$lib/types/school';

	const schoolId = $derived($page.params.id || '');

	let activeTab = $state<'info' | 'students' | 'admins'>('info');

	let showStudentFilters = $state(false);
	let showAdminFilters = $state(false);

	let studentFirstNameFilter = $state('');
	let studentLastNameFilter = $state('');
	let studentEmailFilter = $state('');

	let adminFirstNameFilter = $state('');
	let adminLastNameFilter = $state('');
	let adminEmailFilter = $state('');

	let studentParams = $state<UserQueryParams>({
		limit: 10,
		offset: 0
	});

	let adminParams = $state<UserQueryParams>({
		limit: 10,
		offset: 0
	});

	const schoolFullInfo = $derived(useSchoolFullInfo(schoolId!));
	const students = $derived(useSchoolStudents(schoolId!, studentParams));
	const admins = $derived(useSchoolAdmins(schoolId!, adminParams));

	function applyStudentFilters() {
		studentParams = {
			limit: 10,
			offset: 0,
			first_name: studentFirstNameFilter || undefined,
			last_name: studentLastNameFilter || undefined,
			email: studentEmailFilter || undefined
		};
	}

	function clearStudentFilters() {
		studentFirstNameFilter = '';
		studentLastNameFilter = '';
		studentEmailFilter = '';
		studentParams = {
			limit: 10,
			offset: 0
		};
		showStudentFilters = false;
	}

	function applyAdminFilters() {
		adminParams = {
			limit: 10,
			offset: 0,
			first_name: adminFirstNameFilter || undefined,
			last_name: adminLastNameFilter || undefined,
			email: adminEmailFilter || undefined
		};
	}

	function clearAdminFilters() {
		adminFirstNameFilter = '';
		adminLastNameFilter = '';
		adminEmailFilter = '';
		adminParams = {
			limit: 10,
			offset: 0
		};
		showAdminFilters = false;
	}

	function handleStudentPageChange(direction: 'next' | 'prev') {
		if (direction === 'next') {
			studentParams = {
				...studentParams,
				offset: studentParams.offset! + studentParams.limit!
			};
		} else {
			studentParams = {
				...studentParams,
				offset: Math.max(0, studentParams.offset! - studentParams.limit!)
			};
		}
	}

	function handleAdminPageChange(direction: 'next' | 'prev') {
		if (direction === 'next') {
			adminParams = {
				...adminParams,
				offset: adminParams.offset! + adminParams.limit!
			};
		} else {
			adminParams = {
				...adminParams,
				offset: Math.max(0, adminParams.offset! - adminParams.limit!)
			};
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<div class="mb-1">
				<Button variant="ghost" href="/schools" class="mb-2 -ml-4">
					<ChevronLeftIcon class="mr-1 h-4 w-4" />
					Back to Schools
				</Button>
			</div>
			{#if schoolFullInfo.isLoading}
				<Skeleton class="mb-2 h-8 w-64" />
				<Skeleton class="h-4 w-48" />
			{:else if schoolFullInfo.data}
				<h1 class="text-3xl font-bold tracking-tight">{schoolFullInfo.data.name}</h1>
				{#if schoolFullInfo.data.address}
					<p class="flex items-center text-muted-foreground">
						<MapPinIcon class="mr-1 h-4 w-4" />
						{schoolFullInfo.data.address}
					</p>
				{/if}
			{/if}
		</div>
	</div>

	{#if schoolFullInfo.isLoading}
		<div class="grid gap-4 md:grid-cols-3">
			<Card.Root>
				<Card.Content class="pt-6">
					<Skeleton class="h-20 w-full" />
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Content class="pt-6">
					<Skeleton class="h-20 w-full" />
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Content class="pt-6">
					<Skeleton class="h-20 w-full" />
				</Card.Content>
			</Card.Root>
		</div>
	{:else if schoolFullInfo.isError}
		<Card.Root>
			<Card.Content class="pt-6">
				<div class="py-8 text-center text-destructive">
					<p>Error loading school information</p>
					<p class="text-sm">{schoolFullInfo.error?.message}</p>
				</div>
			</Card.Content>
		</Card.Root>
	{:else if schoolFullInfo.data}
		<div class="grid gap-4 md:grid-cols-3">
			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-muted-foreground">Total Students</p>
							<p class="text-3xl font-bold">{schoolFullInfo.data.total_students}</p>
						</div>
						<div class="rounded-full bg-primary/10 p-3">
							<GraduationCapIcon class="h-6 w-6 text-primary" />
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-muted-foreground">Total Teachers</p>
							<p class="text-3xl font-bold">{schoolFullInfo.data.total_teachers}</p>
						</div>
						<div class="rounded-full bg-primary/10 p-3">
							<UsersIcon class="h-6 w-6 text-primary" />
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-muted-foreground">Total Admins</p>
							<p class="text-3xl font-bold">{schoolFullInfo.data.total_admins}</p>
						</div>
						<div class="rounded-full bg-primary/10 p-3">
							<UserCogIcon class="h-6 w-6 text-primary" />
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
				Students ({schoolFullInfo.data?.total_students ?? 0})
			</button>
			<button
				onclick={() => (activeTab = 'admins')}
				class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'admins'
					? 'border-primary text-primary'
					: 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700'}"
			>
				Admins ({schoolFullInfo.data?.total_admins ?? 0})
			</button>
		</nav>
	</div>

	{#if activeTab === 'info'}
		<Card.Root>
			<Card.Header>
				<Card.Title>School Information</Card.Title>
				<Card.Description>Basic details about the school</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if schoolFullInfo.isLoading}
					<div class="space-y-4">
						<Skeleton class="h-6 w-full" />
						<Skeleton class="h-6 w-full" />
						<Skeleton class="h-6 w-3/4" />
					</div>
				{:else if schoolFullInfo.data}
					<div class="space-y-4">
						<div class="grid grid-cols-3 gap-4">
							<div class="font-medium text-muted-foreground">Name:</div>
							<div class="col-span-2">{schoolFullInfo.data.name}</div>
						</div>
						<div class="grid grid-cols-3 gap-4">
							<div class="font-medium text-muted-foreground">Address:</div>
							<div class="col-span-2">{schoolFullInfo.data.address || 'N/A'}</div>
						</div>
						<div class="grid grid-cols-3 gap-4">
							<div class="font-medium text-muted-foreground">School ID:</div>
							<div class="col-span-2 font-mono text-sm">{schoolFullInfo.data.id}</div>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{:else if activeTab === 'students'}
		<Card.Root>
			<Card.Header>
				<div class="flex items-center justify-between">
					<div>
						<Card.Title>Students</Card.Title>
						<Card.Description>List of all students enrolled in this school</Card.Description>
					</div>
					<Button
						variant="outline"
						size="sm"
						onclick={() => (showStudentFilters = !showStudentFilters)}
					>
						<FilterIcon class="mr-1 h-4 w-4" />
						{showStudentFilters ? 'Hide' : 'Show'} Filters
					</Button>
				</div>
			</Card.Header>
			<Card.Content>
				{#if showStudentFilters}
					<div class="mb-4 flex flex-wrap gap-2 rounded-lg border bg-muted/50 p-4">
						<div class="min-w-[200px] flex-1">
							<Input
								bind:value={studentFirstNameFilter}
								placeholder="Filter by first name..."
								class="w-full"
							/>
						</div>
						<div class="min-w-[200px] flex-1">
							<Input
								bind:value={studentLastNameFilter}
								placeholder="Filter by last name..."
								class="w-full"
							/>
						</div>
						<div class="min-w-[200px] flex-1">
							<Input
								bind:value={studentEmailFilter}
								placeholder="Filter by email..."
								class="w-full"
							/>
						</div>
						<div class="flex gap-2">
							<Button onclick={applyStudentFilters} size="sm">
								<SearchIcon class="mr-1 h-4 w-4" />
								Search
							</Button>
							<Button
								onclick={clearStudentFilters}
								variant="outline"
								size="sm"
								disabled={!studentFirstNameFilter && !studentLastNameFilter && !studentEmailFilter}
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
									<Table.Head>Role</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each students.data.data as student (student.id)}
									<Table.Row>
										<Table.Cell class="font-medium"
											>{student.first_name} {student.last_name}</Table.Cell
										>
										<Table.Cell>{student.email}</Table.Cell>
										<Table.Cell class="capitalize">{student.role.replace('_', ' ')}</Table.Cell>
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
									disabled={studentParams.offset === 0}
									onclick={() => handleStudentPageChange('prev')}
								>
									<ChevronLeftIcon class="h-4 w-4" />
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={!students.data.meta.has_more}
									onclick={() => handleStudentPageChange('next')}
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
	{:else if activeTab === 'admins'}
		<Card.Root>
			<Card.Header>
				<div class="flex items-center justify-between">
					<div>
						<Card.Title>Admins</Card.Title>
						<Card.Description>List of all admins managing this school</Card.Description>
					</div>
					<Button
						variant="outline"
						size="sm"
						onclick={() => (showAdminFilters = !showAdminFilters)}
					>
						<FilterIcon class="mr-1 h-4 w-4" />
						{showAdminFilters ? 'Hide' : 'Show'} Filters
					</Button>
				</div>
			</Card.Header>
			<Card.Content>
				{#if showAdminFilters}
					<div class="mb-4 flex flex-wrap gap-2 rounded-lg border bg-muted/50 p-4">
						<div class="min-w-[200px] flex-1">
							<Input
								bind:value={adminFirstNameFilter}
								placeholder="Filter by first name..."
								class="w-full"
							/>
						</div>
						<div class="min-w-[200px] flex-1">
							<Input
								bind:value={adminLastNameFilter}
								placeholder="Filter by last name..."
								class="w-full"
							/>
						</div>
						<div class="min-w-[200px] flex-1">
							<Input
								bind:value={adminEmailFilter}
								placeholder="Filter by email..."
								class="w-full"
							/>
						</div>
						<div class="flex gap-2">
							<Button onclick={applyAdminFilters} size="sm">
								<SearchIcon class="mr-1 h-4 w-4" />
								Search
							</Button>
							<Button
								onclick={clearAdminFilters}
								variant="outline"
								size="sm"
								disabled={!adminFirstNameFilter && !adminLastNameFilter && !adminEmailFilter}
							>
								<XIcon class="mr-1 h-4 w-4" />
								Clear
							</Button>
						</div>
					</div>
				{/if}
				{#if admins.isLoading}
					<div class="flex items-center justify-center py-8">
						<Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				{:else if admins.isError}
					<div class="py-8 text-center text-destructive">
						<p>Error loading admins</p>
						<p class="text-sm">{admins.error?.message}</p>
					</div>
				{:else if admins.data}
					{#if admins.data.data.length === 0}
						<div class="py-8 text-center text-muted-foreground">
							<UserCogIcon class="mx-auto mb-2 h-12 w-12 opacity-20" />
							<p>No admins found</p>
						</div>
					{:else}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Name</Table.Head>
									<Table.Head>Email</Table.Head>
									<Table.Head>Role</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each admins.data.data as admin (admin.id)}
									<Table.Row>
										<Table.Cell class="font-medium">{admin.first_name} {admin.last_name}</Table.Cell
										>
										<Table.Cell>{admin.email}</Table.Cell>
										<Table.Cell class="capitalize">{admin.role.replace('_', ' ')}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
						<div class="mt-4 flex items-center justify-between">
							<div class="text-sm text-muted-foreground">
								Showing {adminParams.offset! + 1} to {Math.min(
									adminParams.offset! + adminParams.limit!,
									admins.data.meta.total
								)} of {admins.data.meta.total} admins
							</div>
							<div class="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={adminParams.offset === 0}
									onclick={() => handleAdminPageChange('prev')}
								>
									<ChevronLeftIcon class="h-4 w-4" />
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={!admins.data.meta.has_more}
									onclick={() => handleAdminPageChange('next')}
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
	{/if}
</div>
