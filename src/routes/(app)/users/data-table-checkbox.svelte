<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';

	type CheckboxProps = {
		checked: boolean;
		indeterminate?: boolean;
		onCheckedChange: (value: boolean) => void;
		'aria-label'?: string;
	};

	let {
		checked,
		indeterminate = false,
		onCheckedChange,
		'aria-label': ariaLabel
	}: CheckboxProps = $props();
</script>

<Checkbox
	{checked}
	{indeterminate}
	onCheckedChange={(value) => onCheckedChange(!!value)}
	aria-label={ariaLabel}
/>
