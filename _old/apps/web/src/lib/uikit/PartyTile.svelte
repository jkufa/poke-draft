<script lang="ts">
	import Sprite from './Sprite.svelte';
	import { gameState } from '$lib/GameState.svelte';

	interface Props {
		name?: string;
		id?: number;
		isActive: boolean;
	}
	let { name, id = 0, isActive }: Props = $props();
</script>

<div
	class={{
		'flex flex-col items-center justify-center rounded-sm border border-gray-200 bg-gray-50 py-4 transition-colors duration-200': true,
		'animate-pulse border-amber-300! bg-amber-300/8!': isActive
	}}
>
	<div class="mt-auto max-h-24">
		<Sprite {name} {id} />
	</div>
</div>
