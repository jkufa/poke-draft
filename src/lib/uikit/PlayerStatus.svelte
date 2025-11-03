<script lang="ts">
	import type { Player, PlayerStatus, PlayerType, Side } from '$lib/GameState.svelte';
	type StatusText = Record<PlayerStatus, Record<PlayerType, string>>;

	interface Props {
		player: Player;
	}
	let { player }: Props = $props();

	let { playerType, username, status, side, initiative } = $derived(player);
	const statusTexts = $derived({
		ACTIVE: {
			PLAYER: 'YOUR TURN',
			OPPONENT: 'DRAFTING'
		},
		INACTIVE: {
			OPPONENT: 'UP NEXT',
			PLAYER: 'UP NEXT'
		},
		PRE_DRAFT: {
			PLAYER: initiative === 0 ? 'GOES FIRST 👑' : 'GOES SECOND',
			OPPONENT: initiative === 0 ? 'GOES FIRST 👑' : 'GOES SECOND'
		},
		COMPLETE: {
			PLAYER: 'DRAFT COMPLETE',
			OPPONENT: 'DRAFT COMPLETE'
		}
	} as const);
	const statusText = $derived(statusTexts[status][playerType]);
</script>

<div class="flex items-center gap-2 {side === 'RIGHT' ? 'flex-row-reverse text-end' : ''}">
	<div class="flex flex-col">
		<p class="text-sm">{username}</p>
		<div class="flex items-center gap-2">
			<p
				class={{
					'text-lg font-bold text-gold': status === 'ACTIVE',
					'text-lg font-medium text-black/80': status === 'INACTIVE'
				}}
			>
				{statusText}
			</p>
			{#if status === 'ACTIVE'}
				{@render Notification()}
			{/if}
		</div>
	</div>
</div>

{#snippet Notification()}
	<div class="relative flex size-3">
		<div
			class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75"
		></div>
		<div class="relative inline-flex size-3 rounded-full bg-amber-400"></div>
	</div>
{/snippet}
