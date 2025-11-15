import { wsClient } from '../../dist/zod';


const client = wsClient({
  url: "ws://localhost:5175",
});
export const websocketContext = $state(client);
