<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { websocketContext } from '$lib/WebSocketContext.svelte.js';
	import { untrack } from 'svelte';
	import type { ClientPlayer } from '@repo/draft-engine';

	let { data } = $props();

	let username = $state('Player');
	let players = $state<ClientPlayer[]>([]);
	const host = $derived(players.find((p) => p.type === 'HOST'));
	const guest = $derived(players.find((p) => p.type === 'GUEST'));

	const ws = websocketContext;
	$effect(() => {
		untrack(() => {
			const roomId = data.roomId;
			const userId = data.userId;
			ws.onmessage = (event) => {
				if (typeof event.data === 'string' && !event.data.startsWith('{')) {
					console.log(event.data);
					return;
				}
				const { type, status, message, data } = JSON.parse(event.data) as {
					type: string;
					status: 'success' | 'error';
					message: string;
					data: any;
				};

				if (type === 'JOIN_ROOM') {
					if (status === 'success') {
						players = data.users;
						username = 'Player ' + (host?.userId === userId ? '1' : '2');
					} else {
						console.error('Join room failed', message);
					}
				}
			};
			ws.onopen = () => {
				console.log('connected to websocket');
				ws.send(
					JSON.stringify({
						type: 'JOIN_ROOM',
						data: {
							roomId: data.roomId
						}
					})
				);
			};
			ws.onclose = () => {
				console.log('disconnected from websocket');
			};
			ws.onerror = (event) => {
				console.error('websocket error', event);
			};
		});
	});

	function copyRoomId() {
		navigator.clipboard.writeText(data.roomId);
	}
	function shareLink() {
		navigator.clipboard.writeText(window.location.href);
	}

	function handleLeave() {
		console.log('beforeunload');
		ws.send(
			JSON.stringify({
				type: 'LEAVE_ROOM',
				data: {
					roomId: data.roomId
				}
			})
		);
	}
</script>

<svelte:window on:beforeunload={handleLeave} />

<div class="mt-16 flex flex-col items-center justify-center gap-8">
	<div class="flex items-center gap-2">
		<h1 class="text-2xl font-bold">Room: {data.roomId}</h1>
		<button
			class="rounded-xs border border-gray-500 px-4 py-2 disabled:opacity-50"
			onclick={copyRoomId}
		>
			Copy room ID
		</button>
	</div>

	<div class="flex flex-col items-center gap-2">
		{@render PlayerSlot({ player: host })}
		{@render PlayerSlot({ player: guest })}
	</div>

	<button class="rounded-xs border border-gray-500 px-4 py-2 disabled:opacity-50">
		Start game
	</button>
</div>

{#snippet PlayerSlot({ player }: { player: ClientPlayer | undefined })}
	{data.userId}
	{player?.userId}
	<div class="player1 w-full">
		{#if player?.userId === data?.userId}
			You:
			<input
				type="text"
				placeholder="Enter your username"
				bind:value={username}
				disabled
				class="outline:border-gray-500 rounded-xs p-2 not:disabled:hover:outline disabled:opacity-50"
			/>
		{:else}
			<!-- Not you, but are they connected? -->
			{#if player?.userId === undefined}
				<span> Waiting for opponent... </span>
				<button
					onclick={shareLink}
					class="rounded-xs border border-gray-500 px-4 py-2 disabled:opacity-50"
				>
					Share link
				</button>
			{:else}
				<span> Opponent: {player.username ?? 'Player 2'} </span>
			{/if}
		{/if}
	</div>
{/snippet}
