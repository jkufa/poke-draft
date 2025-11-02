<script lang="ts">
	import { DraftGrid, PlayerSide } from '$lib/uikit';

	let { data } = $props();
	console.log(data.draftlist.pokemon);
</script>

<div class="max-w-8xl mx-auto px-8">
	<div class="grid-cols grid justify-between gap-4">
		<PlayerSide playerType="PLAYER" username="Player 1" status="ACTIVE" side="LEFT" />
		<div class="">
			<DraftGrid pokemonList={data.draftlist.pokemon} />
		</div>
		<PlayerSide playerType="OPPONENT" username="Player 2" status="INACTIVE" side="RIGHT" />
	</div>
</div>

<style>
	.grid-cols {
		grid-template-columns: 8.5rem minmax(0, 80rem) 8.5rem;
	}
</style>
