<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import UsersIcon from '@lucide/svelte/icons/users';
	import UserCogIcon from '@lucide/svelte/icons/user-cog';
	import type { SchoolFullInfo } from '$lib/types/school';

	interface Props {
		schoolInfo: SchoolFullInfo | undefined;
		isLoading: boolean;
		isError: boolean;
		errorMessage?: string;
	}

	let { schoolInfo, isLoading, isError, errorMessage }: Props = $props();
</script>

{#if isLoading}
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
{:else if isError}
	<Card.Root>
		<Card.Content class="pt-6">
			<div class="py-8 text-center text-destructive">
				<p>Error loading school information</p>
				{#if errorMessage}
					<p class="text-sm">{errorMessage}</p>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>
{:else if schoolInfo}
	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root>
			<Card.Content class="pt-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-muted-foreground">Total Students</p>
						<p class="text-3xl font-bold">{schoolInfo.total_students}</p>
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
						<p class="text-3xl font-bold">{schoolInfo.total_teachers}</p>
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
						<p class="text-3xl font-bold">{schoolInfo.total_admins}</p>
					</div>
					<div class="rounded-full bg-primary/10 p-3">
						<UserCogIcon class="h-6 w-6 text-primary" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
{/if}
