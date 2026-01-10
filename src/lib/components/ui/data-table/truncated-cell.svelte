<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';

	let {
		value,
		maxWidth = '150px',
		class: className = ''
	}: {
		value: string;
		maxWidth?: string;
		class?: string;
	} = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger class="cursor-default">
		<span class="block truncate text-sm {className}" style="max-width: {maxWidth};">
			{value}
		</span>
	</Tooltip.Trigger>
	<Tooltip.Content>
		<p class="max-w-xs text-sm wrap-break-word">{value}</p>
	</Tooltip.Content>
</Tooltip.Root>
