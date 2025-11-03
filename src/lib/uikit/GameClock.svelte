<script lang="ts">
	import { untrack } from 'svelte';
	import { gameState } from '$lib/GameState.svelte';

	const TURN_TEXT = {
		PRE_DRAFT: 'Drafting starts in:',
		DRAFT: 'TIMER:',
		POST_DRAFT: 'Draft completed!'
	} as const;

	let turnText = $derived(TURN_TEXT[gameState.turn.turnType]);
</script>

<div class="flex items-center justify-center gap-1.5">
	<p>{turnText}</p>
	{#if gameState.clock.timeRemaining >= 0 && gameState.turn.turnType !== 'POST_DRAFT'}
		<span
			class={{
				'text-2xl font-bold transition-colors duration-400': true,
				'quick-pulse text-gold': gameState.clock.timeRemaining <= 10
			}}
			>{gameState.clock.timeRemaining}
		</span>
	{/if}
</div>

<style>
	.quick-pulse {
		animation: pulse 1s infinite;
	}
	@keyframes pulse {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.75;
		}
	}
</style>
