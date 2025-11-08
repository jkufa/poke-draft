import { Receiver, ReceiverKey } from "./recievers";

export type WebSocketData = {
  roomId: string | null;
  username: string;
};

type PlayerAction = {
  actionType: 'SELECT_POKEMON';
  pokemonId: string;
  turnNumber: number;
}



const rooms: Record<string, Room> = {};

function createRoom(roomId: string, player: Player) {
  if (rooms[roomId]) {
    console.error(`Room ${roomId} already exists`);
    return null;
  }
  rooms[roomId] = {
    roomId,
    players: { [player.username]: player },
  };

  return rooms[roomId];
}

const wss = Bun.serve({ 
  fetch(req, server) {
    const cookies = req.headers.get("cookie") ?? '';
    const cookieMap = new Bun.CookieMap(cookies);
    const username = cookieMap.get("username");
    const roomId = new URL(req.url).searchParams.get("roomId");

    if (!username || !roomId) {
      return new Response("Unauthorized", { status: 401 });
    }
    
    // upgrade the request to a WebSocket
    const sessionId = generateSessionId();
    const result = server.upgrade(req, {
      data: {
        roomId,
        username,
      },
      headers: {
        "Set-Cookie": `SessionId=${sessionId}`,
      }
    });
    if (result) {
      console.log(`upgraded request to websocket!`);
      return;
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    data: {} as WebSocketData,
    message(ws, message) {
      if (typeof message !== 'string') {
        ws.send('Invalid message type');
        return;
      }
      const { type, data } = JSON.parse(message) as { type: ReceiverKey, data: unknown };
      Receiver.validate(type, data).run(ws);
    },
    open(ws) {
      ws.send('connection opened with' + ws.data.username + ' from ' + ws.remoteAddress);
    },
    close(ws) {
      console.log('close');
      ws.publish(`roomId:${ws.data.roomId}`, `${ws.data.username} disconnected`);
      ws.unsubscribe(`roomId:${ws.data.roomId}`);
    },
    drain(ws) {
      console.log('drain');
      ws.send('Ack: drain');
    },
  }
});

console.log(`Listening on ${wss.hostname}:${wss.port}`);

function generateSessionId() {
  return crypto.randomUUID();
}