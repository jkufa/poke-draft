<script lang="ts">
	import type { Player } from '$lib/GameState.svelte';
	import Party from './Party.svelte';
	import PlayerStatus from './PlayerStatus.svelte';

	interface Props {
		player: Player;
	}
	let { player }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<PlayerStatus {player} />
	<div class={player.side === 'RIGHT' ? 'self-end' : ''}>
		<Party {player} />
	</div>
</div>
