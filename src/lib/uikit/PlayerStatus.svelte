<script lang="ts">
	const STATUS = {
		ACTIVE: {
			PLAYER: 'YOUR TURN',
			OPPONENT: 'DRAFTING'
		},
		INACTIVE: {
			OPPONENT: 'UP NEXT',
			PLAYER: 'UP NEXT'
		}
	} as const;

	interface Props {
		playerType: 'PLAYER' | 'OPPONENT';
		status: 'ACTIVE' | 'INACTIVE';
		username: string;
		side: 'LEFT' | 'RIGHT';
	}
	let { playerType, username, status, side }: Props = $props();

	let statusText = $state(STATUS[status][playerType]);
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
