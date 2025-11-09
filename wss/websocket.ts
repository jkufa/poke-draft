import { Receiver, ReceiverKey } from "./receivers";

export type WebSocketData = {
  userId: string;
  subscriptions: Set<string>;
};

const wss = Bun.serve({
  fetch(req, server) {
    const cookies = req.headers.get("cookie") ?? '';
    const cookieMap = new Bun.CookieMap(cookies);
    const userId = cookieMap.get("userId");

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    
    // upgrade the request to a WebSocket
    const sessionId = generateSessionId();
    const result = server.upgrade(req, {
      data: {
        userId: userId,
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
      ws.send('connection opened with' + ws.data.userId + ' from ' + ws.remoteAddress);
    },
    close(ws) {
      console.log(`Connection closed for ${ws.data.userId}`);
      for (const topic of ws.data.subscriptions) {
        ws.unsubscribe(topic);
        console.log(`Unsubscribed from ${topic}`);
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