<script lang="ts">
	import Sprite from './Sprite.svelte';
	import { gameState } from '$lib/GameState.svelte';

	interface Props {
		name?: string;
		id?: number;
	}
	let { name, id = 0 }: Props = $props();

	function addToParty() {
		if (!id || !name) return;
		gameState.addToParty('PLAYER', { id, name });
	}
</script>

<button
	class={{
		'flex flex-col items-center justify-center rounded-sm border border-gray-200 bg-gray-50 py-4 transition-[scale,opacity] duration-200': true,
		'hover:scale-106': !gameState.draftedPokemon.has(id),
		'disabled opacity-50 grayscale': gameState.draftedPokemon.has(id)
	}}
	onclick={addToParty}
>
	<!-- <p class="text-sm capitalize">{name}</p> -->
	<div class="mt-auto max-h-24">
		<Sprite {name} {id} />
	</div>
</button>
