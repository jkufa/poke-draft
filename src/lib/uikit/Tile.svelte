<script lang="ts">
	import Sprite from './Sprite.svelte';

	interface Props {
		name?: string;
		id?: number;
	}
	let { name, id }: Props = $props();
</script>

<button
	class="flex flex-col items-center justify-center rounded-sm border border-gray-200 bg-gray-50 py-4 transition-transform duration-200 hover:scale-105"
>
	<p class="text-sm capitalize">{name}</p>
	<div class="mt-auto max-h-24">
		<Sprite {name} {id} />
	</div>
</button>
