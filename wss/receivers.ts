import { ServerWebSocket } from 'bun';
import { BasePlayer } from './player';
import { roomManager as rm } from './room';
import { WebSocketData } from './websocket';

const RECEIVER_KEYS = [
  'UPDATE_USERNAME',
  'CREATE_ROOM',
  'JOIN_ROOM',
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

type Test = {
  username: string;
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
    const player: BasePlayer = {
      userId: ws.data.userId,
      ipAddress: ws.remoteAddress,
      username: message.username,
    };
    const roomId = rm.createRoom(player);
    if (roomId) {
      console.log(`${ws.data.userId} created the room ${roomId}`);
      const topic = `roomId:${roomId}`;
      ws.subscribe(topic);
      ws.data.subscriptions.add(topic);
      ws.send(JSON.stringify({
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
  JOIN_ROOM: (ws, message) => {
    if (typeof message !== 'object' || message === null || !('roomId' in message) || typeof message.roomId !== 'string') {
      ws.send('Invalid message: roomId required');
      return;
    }
    const roomId = message.roomId;
    const player: BasePlayer = {
      userId: ws.data.userId,
      ipAddress: ws.remoteAddress,
    };
    const success = rm.joinRoom(roomId, player);
    if (success) {
      const topic = `roomId:${roomId}`;
      ws.subscribe(topic);
      ws.data.subscriptions.add(topic);
      ws.publish(topic, `${ws.data.userId} joined the room`);
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
    const player: BasePlayer = {
      userId: ws.data.userId,
      ipAddress: ws.remoteAddress,
    };
    const success = rm.leaveRoom(roomId, player);
    if (success) {
      const topic = `roomId:${roomId}`;
      ws.publish(topic, `${ws.data.userId} left the room`);
      ws.unsubscribe(topic);
      ws.data.subscriptions.delete(topic);
    } else {
      ws.send('Leave room failed');
    }
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
    if (room.host.userId === ws.data.userId) {
      room.startGame();
      ws.send('Game started successfully');
    } else {
      ws.send('You are not the host of the room');
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