<script lang="ts">
	import Party from './Party.svelte';
	import PlayerStatus from './PlayerStatus.svelte';

	interface Props {
		playerType: 'PLAYER' | 'OPPONENT';
		username: string;
		status: 'ACTIVE' | 'INACTIVE';
		side: 'LEFT' | 'RIGHT';
	}
	let { playerType, username, status, side }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<PlayerStatus {playerType} {username} {status} {side} />
	<Party />
</div>
