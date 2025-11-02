<script lang="ts">
	import Tile from './Tile.svelte';

	interface Props {}
	const party = new Array(6).fill(null);
</script>

<div class="flex max-w-34 flex-col gap-4">
	{#each party as slot}
		<Tile name={slot?.name} id={slot?.id} />
	{/each}
</div>
