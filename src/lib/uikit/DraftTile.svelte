<script lang="ts">
	const CRY_URL = '/cries/latest';

	import Sprite from './Sprite.svelte';
	import { gameState } from '$lib/GameState.svelte';
	import { MAX_PARTY_SIZE } from '$lib/pokemon';

	interface Props {
		name?: string;
		id?: number;
	}
	let { name, id = 0 }: Props = $props();
	const cry = $derived(new URL(`${CRY_URL}/${id}.ogg`, import.meta.url).href);

	function addToParty() {
		if (!id || !name) return;
		if (gameState.draftedPokemon.has(id)) return;
		if (gameState.player.party.length >= MAX_PARTY_SIZE) return;
		gameState.addToParty('PLAYER', { id, name });
		const audio = new Audio(cry);
		audio.volume = 0.5;
		audio.play();
	}
</script>

<button
	class={{
		'flex flex-col items-center justify-center rounded-sm border border-gray-200 bg-gray-50 py-4 transition-[scale,opacity] duration-200': true,
		'cursor-pointer hover:scale-106':
			gameState.player.status === 'ACTIVE' && !gameState.draftedPokemon.has(id),
		'disabled opacity-50 grayscale': gameState.draftedPokemon.has(id)
	}}
	onclick={addToParty}
>
	<!-- <p class="text-sm capitalize">{name}</p> -->
	<div class="mt-auto max-h-24">
		<Sprite {name} {id} />
	</div>
</button>
