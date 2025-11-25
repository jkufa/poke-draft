import { goto } from '$app/navigation';
import { CreateRoomSuccess } from '@repo/websocket';
import { wsClient } from '@ws-kit/client/zod';


const client = wsClient({
  url: "ws://localhost:5175",
});
client.on(CreateRoomSuccess, (msg) => {
  console.log(msg);
  goto(`/room/${msg.payload.roomId}`);
});
await client.connect();

export const websocketContext = $state(client);
