<script lang="ts">
	import DraftTile from './DraftTile.svelte';

	interface Props {
		pokemonList: {
			name: string;
			id: number;
		}[];
	}
	let { pokemonList }: Props = $props();
</script>

<div class="grid grid-cols-[repeat(5,minmax(0,8.5rem))] justify-center gap-4">
	{#each pokemonList as pokemon}
		<DraftTile name={pokemon.name} id={pokemon.id} />
	{/each}
</div>
