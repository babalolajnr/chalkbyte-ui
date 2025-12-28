<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ShieldX, ArrowLeft, Home } from '@lucide/svelte';
</script>

<div class="flex min-h-[80vh] items-center justify-center p-4">
	<Card class="w-full max-w-md text-center">
		<CardHeader class="space-y-4">
			<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
				<ShieldX class="h-10 w-10 text-destructive" />
			</div>
			<CardTitle class="text-2xl">Access Denied</CardTitle>
			<CardDescription class="text-base">
				You don't have permission to access this resource. Please contact your administrator if you
				believe this is an error.
			</CardDescription>
		</CardHeader>
		<CardContent class="flex flex-col gap-3 sm:flex-row sm:justify-center">
			<Button variant="outline" onclick={() => history.back()}>
				<ArrowLeft class="mr-2 h-4 w-4" />
				Go Back
			</Button>
			<Button onclick={() => goto(resolve('/dashboard'))}>
				<Home class="mr-2 h-4 w-4" />
				Dashboard
			</Button>
		</CardContent>
	</Card>
</div>
