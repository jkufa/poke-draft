<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { untrack } from 'svelte';

	let ws: WebSocket | null = null;
	$effect(() => {
		untrack(() => {
			ws = new WebSocket('ws://localhost:3000');
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
				if (type === 'CREATE_ROOM') {
					if (status === 'success') {
						console.log('Room created successfully', data);
						goto(`/room/${data.roomId}`);
					} else {
						console.error('Room creation failed', message);
					}
				}
			};
			ws.onopen = () => {
				console.log('connected to websocket');
			};
			ws.onclose = () => {
				console.log('disconnected from websocket');
			};
			ws.onerror = (event) => {
				console.error('websocket error', event);
			};
		});
	});

	function createRoom() {
		const msg = {
			type: 'CREATE_ROOM',
			data: {
				username: 'Player 1'
			}
		};
		ws?.send(JSON.stringify(msg));
	}
</script>

<div class="mt-16 flex flex-col items-center justify-center gap-8">
	<h1 class="mb-4 text-2xl font-bold">Pokemon Draft Mode</h1>
	<div class="forms space-y-4">
		<form onsubmit={createRoom}>
			<button
				type="submit"
				class="w-full rounded-xs bg-black px-4 py-2 text-white disabled:opacity-50"
			>
				Create Room
			</button>
		</form>

		<div class="flex items-center gap-2">
			<div class="h-px w-full bg-black/30"></div>
			<p class="text-center text-sm opacity-70">OR</p>
			<div class="bg- h-px w-full bg-black/30"></div>
		</div>

		<form>
			<input
				required
				type="text"
				name="roomId"
				placeholder="Room ID"
				class="rounded-xs border border-gray-300 p-2 disabled:opacity-50"
			/>
			<button type="submit" class="rounded-xs border border-gray-500 px-4 py-2 disabled:opacity-50">
				Join Room
			</button>
		</form>
	</div>
</div>
