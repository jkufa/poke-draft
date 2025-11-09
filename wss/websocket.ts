import { Receiver, ReceiverKey } from "./recievers";

export type WebSocketData = {
  username: string;
  subscriptions: Set<string>;
};

const wss = Bun.serve({
  fetch(req, server) {
    const cookies = req.headers.get("cookie") ?? '';
    const cookieMap = new Bun.CookieMap(cookies);
    const username = cookieMap.get("username");

    if (!username) {
      return new Response("Unauthorized", { status: 401 });
    }
    
    // upgrade the request to a WebSocket
    const sessionId = generateSessionId();
    const result = server.upgrade(req, {
      data: {
        username,
        subscriptions: new Set<string>(),
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
      console.log(`Connection closed for ${ws.data.username}`);
      for (const topic of ws.data.subscriptions) {
        ws.unsubscribe(topic);
      }
      ws.data.subscriptions.clear();
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