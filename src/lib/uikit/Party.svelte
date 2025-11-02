<script lang="ts">
	const MAX_PARTY_SIZE = 6;

	import type { Player } from '$lib/GameState.svelte';
	import PartyTile from './PartyTile.svelte';

	interface Props {
		player: Player;
	}
	let { player }: Props = $props();

	const activeSlot = $derived(player.party.length);
</script>

<div class="flex max-w-34 flex-col gap-4">
	{#each new Array(MAX_PARTY_SIZE).fill(null) as _, index}
		<PartyTile
			name={player.party[index]?.name}
			id={player.party[index]?.id}
			isActive={index === activeSlot && player.status === 'ACTIVE'}
		/>
	{/each}
</div>
