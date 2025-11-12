<script lang="ts">
	import { DraftGrid, GameClock, PlayerSide } from '$lib/uikit';
	import { gameState } from '$lib/GameState.svelte';
	import { untrack } from 'svelte';

	let { data } = $props();

	$effect(() => {
		untrack(() => {
			gameState.startGame(data.draftlist.pokemon);
		});
	});
</script>

<div class="max-w-8xl mx-auto px-8">
	<GameClock />
	<div class="grid-cols grid items-end justify-between gap-4">
		<PlayerSide player={gameState.player} />
		<DraftGrid pokemonList={data.draftlist.pokemon} />
		<PlayerSide player={gameState.opponent} />
	</div>
</div>

<style>
	.grid-cols {
		grid-template-columns: 1fr minmax(0, 50rem) 1fr;
	}
</style>
