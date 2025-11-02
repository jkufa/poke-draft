<script lang="ts">
	import Sprite from './Sprite.svelte';
	import { gameState } from '$lib/GameState.svelte';
	import { MAX_PARTY_SIZE } from '$lib/pokemon';

	interface Props {
		name?: string;
		id?: number;
	}
	let { name, id = 0 }: Props = $props();

	function addToParty() {
		if (!id || !name) return;
		if (gameState.player.status !== 'ACTIVE') return;
		if (gameState.draftedPokemon.has(id)) return;
		if (gameState.player.party.length >= MAX_PARTY_SIZE) return;

		const timeRemaining = gameState.clock.timeRemaining;
		gameState.addToParty('PLAYER', { id, name }, timeRemaining);
	}
</script>

<button
	class={{
		'flex flex-col items-center justify-center rounded-sm border border-gray-200 bg-gray-50 py-4 transition-[scale,opacity] duration-400': true,
		'cursor-pointer hover:scale-106':
			gameState.player.status === 'ACTIVE' && !gameState.draftedPokemon.has(id),
		'disabled opacity-50 grayscale': gameState.draftedPokemon.has(id),
		disabled: gameState.player.status !== 'ACTIVE'
	}}
	onclick={addToParty}
>
	<!-- <p class="text-sm capitalize">{name}</p> -->
	<div class="mt-auto max-h-24">
		<Sprite {name} {id} />
	</div>
</button>
