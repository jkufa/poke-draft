<script lang="ts">
	import { DraftGrid, PlayerSide } from '$lib/uikit';
	import { gameState } from '$lib/GameState.svelte';

	let { data } = $props();
</script>

<div class="max-w-8xl mx-auto px-8">
	<div class="grid-cols grid items-end justify-between gap-4">
		<PlayerSide player={gameState.player} />
		<DraftGrid pokemonList={data.draftlist.pokemon} />
		<PlayerSide player={gameState.opponent} />
	</div>
</div>

<style>
	.grid-cols {
		grid-template-columns: 8.5rem minmax(0, 80rem) 8.5rem;
	}
</style>
