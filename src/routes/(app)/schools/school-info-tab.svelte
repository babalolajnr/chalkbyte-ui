<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { SchoolFullInfo } from '$lib/types/school';

	interface Props {
		schoolInfo: SchoolFullInfo | undefined;
		isLoading: boolean;
	}

	let { schoolInfo, isLoading }: Props = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>School Information</Card.Title>
		<Card.Description>Details about your school</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if isLoading}
			<div class="space-y-4">
				<Skeleton class="h-6 w-full" />
				<Skeleton class="h-6 w-full" />
				<Skeleton class="h-6 w-3/4" />
			</div>
		{:else if schoolInfo}
			<div class="space-y-4">
				<div class="grid grid-cols-3 gap-4">
					<div class="font-medium text-muted-foreground">Name</div>
					<div class="col-span-2">{schoolInfo.name}</div>
				</div>
				<div class="grid grid-cols-3 gap-4">
					<div class="font-medium text-muted-foreground">Address</div>
					<div class="col-span-2">{schoolInfo.address || 'Not specified'}</div>
				</div>
				<div class="grid grid-cols-3 gap-4">
					<div class="font-medium text-muted-foreground">School ID</div>
					<div class="col-span-2 font-mono text-sm">{schoolInfo.id}</div>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
