import { ServerWebSocket } from 'bun';
import { SensitivePlayer } from '@repo/draft-engine';
import { roomManager as rm } from '@repo/draft-engine';
import { WebSocketData } from './websocket-data';

const RECEIVER_KEYS = [
  'UPDATE_USERNAME',
  'CREATE_ROOM',
  'JOIN_ROOM',
  'GET_ROOM',
  'LEAVE_ROOM',
  'START_GAME',
  'END_GAME',
  'START_TURN',
  'END_TURN'
] as const;
export type ReceiverKey = (typeof RECEIVER_KEYS)[number];
export const isReceiverKey = (key: string): key is ReceiverKey => {
  return RECEIVER_KEYS.includes(key as ReceiverKey);
}

export const receivers: Record<ReceiverKey, (ws: ServerWebSocket<WebSocketData>, message: any) => void> = {
  UPDATE_USERNAME: (ws, message: { username: string }) => {
    if (typeof message !== 'object' || message === null || !('username' in message) || typeof message.username !== 'string') {
      ws.send('Invalid message: username required');
      return;
    }
    const room = rm.getRoom(ws.data.userId);
    const player = room?.updatePlayer({ userId: ws.data.userId, username: message.username });
    if (player) {
      ws.send('Username updated successfully');
    } else {
      ws.send('Username update failed');
    }
  },
  CREATE_ROOM: (ws, message: { username: string }) => {
    const player: SensitivePlayer = {
      userId: ws.data.userId,
      ipAddress: ws.remoteAddress,
      username: message.username,
      type: 'HOST',
    };
    const roomId = rm.createRoom(player);
    if (roomId) {
      console.log(`${ws.data.userId} created the room ${roomId}`);
      const topic = `roomId:${roomId}`;
      ws.subscribe(topic);
      ws.data.subscriptions.add(topic);
      ws.send(JSON.stringify({
        host: ws.data.userId,
        type: 'CREATE_ROOM',
        status: 'success',
        message: `Room created successfully: ${roomId}`,
        data: {
          roomId: roomId,
        },
      }));
    } else {
      ws.send('Room creation failed');
    }
  },
  GET_ROOM: (ws, message) => {
    if (typeof message !== 'object' || message === null || !('roomId' in message) || typeof message.roomId !== 'string') {
      ws.send('Invalid message: roomId required');
      return;
    }
    const roomId = message.roomId;
    const room = rm.getRoom(roomId);
    if (room) {
      ws.send(JSON.stringify({
        type: 'GET_ROOM',
        status: 'success',
        message: `Room: ${roomId}`,
        data: room,
      }));
      return;
    }
    ws.send(JSON.stringify({
      type: 'GET_ROOM',
      status: 'error',
      message: `Room not found: ${roomId}`,
      data: room,
    }));
  },
  JOIN_ROOM: (ws, message) => {
    if (typeof message !== 'object' || message === null || !('roomId' in message) || typeof message.roomId !== 'string') {
      ws.send('Invalid message: roomId required');
      return;
    }
    const roomId = message.roomId;
    const player: SensitivePlayer = {
      userId: ws.data.userId,
      ipAddress: ws.remoteAddress,
      type: 'GUEST',
    };
    const success = rm.joinRoom(roomId, player);
    if (success) {
      const topic = `roomId:${roomId}`;
      ws.subscribe(topic);
      ws.data.subscriptions.add(topic);
      ws.publish(topic, JSON.stringify({
        type: 'JOIN_ROOM',
        status: 'success',
        message: `Joined room successfully: ${roomId}`,
        data: {
          users: rm.getRoom(roomId)!.players.map(p => SensitivePlayer.toClient(p)) ?? [],
          roomId: roomId,
        },
      }));
      ws.send(JSON.stringify({
        type: 'JOIN_ROOM',
        status: 'success',
        message: `Joined room successfully: ${roomId}`,
        data: {
          users: rm.getRoom(roomId)!.players.map(p => SensitivePlayer.toClient(p)) ?? [],
          roomId: roomId,
        },
      }));
    } else {
      ws.send('Join room failed');
    }
  },
  LEAVE_ROOM: (ws, message) => {
    if (typeof message !== 'object' || message === null || !('roomId' in message) || typeof message.roomId !== 'string') {
      ws.send('Invalid message: roomId required');
      return;
    }
  
    const roomId = message.roomId;
    const player = rm.getRoom(roomId)?.getPlayer(ws.data.userId);

    if (!player) {
      ws.send('Player not found');
      return;
    }

    const success = rm.leaveRoom(roomId, player);
    if (!success) {
      ws.send('Leave room failed');
      return;
    }

    const topic = `roomId:${roomId}`;
    ws.publish(topic, `${ws.data.userId} left the room`);
    ws.unsubscribe(topic);
    ws.data.subscriptions.delete(topic);

  },
  START_GAME: (ws, message) => {
    if (typeof message !== 'object' || message === null || !('roomId' in message) || typeof message.roomId !== 'string') {
      ws.send('Invalid message: roomId required');
      return;
    }
    const roomId = message.roomId;
    const room = rm.getRoom(roomId);
    if (!room) {
      ws.send('Room not found');
      return;
    }
    const host = room.getHost();
    if (!host) {
      ws.send('Host not found');
      return;
    }
    if (host.userId === ws.data.userId) {
      room.startGame();
      ws.send('Game started successfully');
    } else {
      ws.send('You are not the host of the room!');
      return;
    }
  },
  END_GAME: (ws, message) => {
    console.log('END_GAME', message);
  },
  START_TURN: (ws, message) => {
    console.log('START_TURN', message);
  },
  END_TURN: (ws, message) => {
    console.log('END_TURN', message);
  },
} as const;


// Example usage:
// Receiver.validate('CREATE_ROOM', { roomId: '123', username: 'test' }).run(ws);
export class Receiver {
  static validate(key: string, message: unknown) {
    if (!isReceiverKey(key)) {
      return { run: () => { console.error('invalid key')} };
    }
    if (typeof message !== 'object' || message == null) {
      return { run: () => { console.error('invalid message')} };
    }
    return {
      run: (ws: ServerWebSocket<WebSocketData>) => {
        receivers[key](ws, message );
      }
    };
  }
}