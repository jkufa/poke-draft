type WebSocketData = {
  roomId: string | null;
  username: string;
};

type PlayerAction = {
  actionType: 'SELECT_POKEMON';
  pokemonId: string;
  turnNumber: number;
}

const wss = Bun.serve({ 
  fetch(req, server) {
    const cookies = req.headers.get("cookie") ?? '';
    const cookieMap = new Bun.CookieMap(cookies);
    const username = cookieMap.get("username");

    if (!username) {
      return new Response("Unauthorized", { status: 401 });
    }
    console.log(username);
    
    // upgrade the request to a WebSocket
    const sessionId = generateSessionId();
    const roomId = new URL(req.url).searchParams.get("roomId");
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

      return; // do not return a Response
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
      const playerAction = JSON.parse(message) as PlayerAction;
      const { actionType, pokemonId, turnNumber } = playerAction;
      ws.publish(`roomId:${ws.data.roomId}`, `${ws.data.username}: ${actionType} ${pokemonId} ${turnNumber}`);
    },
    open(ws) {
      console.log('open');
      ws.send('Hello from server: ' + (ws.data.roomId ?? 'no room id') + ' ' + (ws.data.username ?? 'no username'));
      ws.subscribe(`roomId:${ws.data.roomId}`);
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