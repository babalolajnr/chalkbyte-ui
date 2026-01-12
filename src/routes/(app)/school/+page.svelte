<script lang="ts">
	import {
		useSchoolFullInfo,
		useSchoolStudents,
		useSchoolAdmins
	} from '$lib/queries/school.queries';
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import type { UserQueryParams } from '$lib/types/school';
	import { Authorize } from '$lib/components/access-control';
	import { SystemPermission, SystemRole } from '$lib/types/permissions';
	import { authStore } from '$lib/stores/auth.store';
	import { hasRole } from '$lib/stores/permissions.store';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import SchoolStatsCards from '../schools/school-stats-cards.svelte';
	import SchoolInfoTab from '../schools/school-info-tab.svelte';
	import SchoolStudentsTab from '../schools/school-students-tab.svelte';
	import SchoolAdminsTab from '../schools/school-admins-tab.svelte';

	const userSchool = $derived($authStore.user?.school);
	const schoolId = $derived(userSchool?.id);
	const isSuperAdmin = $derived(hasRole(SystemRole.SUPER_ADMIN));

	// Redirect super admins to the schools management page
	// Redirect users without a school to the dashboard
	$effect(() => {
		if (isSuperAdmin) {
			goto(resolve('/(app)/schools'));
		} else if (!schoolId) {
			goto(resolve('/(app)/dashboard'));
		}
	});

	let activeTab = $state<'info' | 'students' | 'admins'>('info');

	let studentParams = $state<UserQueryParams>({
		limit: 10,
		offset: 0
	});

	let adminParams = $state<UserQueryParams>({
		limit: 10,
		offset: 0
	});

	const schoolFullInfo = $derived(schoolId ? useSchoolFullInfo(schoolId) : null);
	const students = $derived(schoolId ? useSchoolStudents(schoolId, studentParams) : null);
	const admins = $derived(schoolId ? useSchoolAdmins(schoolId, adminParams) : null);

	function handleStudentParamsChange(params: UserQueryParams) {
		studentParams = params;
	}

	function handleAdminParamsChange(params: UserQueryParams) {
		adminParams = params;
	}
</script>

{#if !schoolId}
	<Card.Root>
		<Card.Content class="py-8">
			<p class="text-center text-muted-foreground">
				You are not assigned to any school. Please contact your administrator.
			</p>
		</Card.Content>
	</Card.Root>
{:else}
	<Authorize permission={SystemPermission.SCHOOLS_READ}>
		<div class="space-y-6">
			<div class="flex items-center justify-between">
				<div>
					{#if schoolFullInfo?.isLoading}
						<Skeleton class="mb-2 h-8 w-64" />
						<Skeleton class="h-4 w-48" />
					{:else if schoolFullInfo?.data}
						<h1 class="text-3xl font-bold tracking-tight">
							{schoolFullInfo.data.name}
						</h1>
						{#if schoolFullInfo.data.address}
							<p class="flex items-center text-muted-foreground">
								<MapPinIcon class="mr-1 h-4 w-4" />
								{schoolFullInfo.data.address}
							</p>
						{/if}
					{/if}
				</div>
			</div>

			<SchoolStatsCards
				schoolInfo={schoolFullInfo?.data}
				isLoading={schoolFullInfo?.isLoading ?? true}
				isError={schoolFullInfo?.isError ?? false}
				errorMessage={schoolFullInfo?.error?.message}
			/>

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
					<Authorize permission={SystemPermission.STUDENTS_READ}>
						<button
							onclick={() => (activeTab = 'students')}
							class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab ===
							'students'
								? 'border-primary text-primary'
								: 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700'}"
						>
							Students ({schoolFullInfo?.data?.total_students ?? 0})
						</button>
					</Authorize>
					<Authorize permission={SystemPermission.USERS_READ}>
						<button
							onclick={() => (activeTab = 'admins')}
							class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab ===
							'admins'
								? 'border-primary text-primary'
								: 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700'}"
						>
							Admins ({schoolFullInfo?.data?.total_admins ?? 0})
						</button>
					</Authorize>
				</nav>
			</div>

			{#if activeTab === 'info'}
				<SchoolInfoTab
					schoolInfo={schoolFullInfo?.data}
					isLoading={schoolFullInfo?.isLoading ?? true}
				/>
			{:else if activeTab === 'students' && students}
				<SchoolStudentsTab {students} {studentParams} onParamsChange={handleStudentParamsChange} />
			{:else if activeTab === 'admins' && admins}
				<SchoolAdminsTab {admins} {adminParams} onParamsChange={handleAdminParamsChange} />
			{/if}
		</div>
		{#snippet fallback()}
			<Card.Root>
				<Card.Content class="py-8">
					<p class="text-center text-muted-foreground">
						You don't have permission to view school information.
					</p>
				</Card.Content>
			</Card.Root>
		{/snippet}
	</Authorize>
{/if}
