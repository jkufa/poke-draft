<script lang="ts">
	import type { Player } from '$lib/GameState.svelte';
	import Party from './Party.svelte';
	import PlayerStatus from './PlayerStatus.svelte';

	interface Props {
		player: Player;
	}
	let { player }: Props = $props();
	let { playerType, username, status, side, party } = player;
</script>

<div class="flex flex-col gap-4">
	<PlayerStatus {playerType} {username} {status} {side} />
	<Party {player} />
</div>
