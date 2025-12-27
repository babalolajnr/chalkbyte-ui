<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	type CheckboxProps = {
		checked?: boolean;
		indeterminate?: boolean;
		onCheckedChange?: (value: boolean) => void;
		'aria-label'?: string;
	};

	let { checked = false, indeterminate = false, onCheckedChange, ...restProps }: CheckboxProps = $props();
</script>

<Checkbox
	{checked}
	{indeterminate}
	onCheckedChange={(value) => {
		onCheckedChange?.(!!value);
	}}
	{...restProps}
/>
