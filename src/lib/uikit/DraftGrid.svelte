<script lang="ts">
	import { Tile } from '.';

	interface Props {
		pokemonList: {
			name: string;
			id: number;
		}[];
	}
	let { pokemonList }: Props = $props();
</script>

<div class="grid grid-cols-5 gap-4">
	{#each pokemonList as pokemon}
		<Tile name={pokemon.name} id={pokemon.id} />
	{/each}
</div>
