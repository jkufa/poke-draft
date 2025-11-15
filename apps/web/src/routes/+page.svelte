<script lang="ts">
	import { goto } from '$app/navigation';
	import { websocketContext } from '$lib/client/WebSocketContext.svelte';
	import { untrack } from 'svelte';
	import { CreateRoom, CreateRoomSuccess } from '@repo/websocket';

	const wsc = websocketContext;
	$effect(() => {
		untrack(async () => {
			await wsc.connect();
		});
	});

	async function createRoom() {
		await wsc.send(CreateRoom);
		await wsc.on(CreateRoomSuccess, (msg) => {
			goto(`/room/${msg.payload.roomId}`);
		});
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
