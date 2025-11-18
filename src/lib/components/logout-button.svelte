<script lang="ts">
	import { useLogout } from '$lib/queries/auth.queries';
	import { Button } from '$lib/components/ui/button';

	const logoutMutation = useLogout();

	function handleLogout() {
		logoutMutation.mutate();
	}
</script>

<Button onclick={handleLogout} disabled={logoutMutation.isPending} variant="outline">
	{#if logoutMutation.isPending}
		Logging out...
	{:else}
		Logout
	{/if}
</Button>
