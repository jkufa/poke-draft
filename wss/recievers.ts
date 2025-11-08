import { ServerWebSocket } from 'bun';
import { Player } from './player';
import { roomManager as rm } from './room';
import { WebSocketData } from './websocket';
import { Engine } from './engine';

const RECEIVER_KEYS = ['CREATE_ROOM', 'JOIN_ROOM', 'LEAVE_ROOM', 'START_GAME', 'END_GAME', 'START_TURN', 'END_TURN'] as const;
export type ReceiverKey  = (typeof RECEIVER_KEYS)[number];
export const isReceiverKey = (key: string): key is ReceiverKey => {
  return RECEIVER_KEYS.includes(key as ReceiverKey);
}

// type ReceiverMessage = Player | Room

export const receivers: Record<ReceiverKey, (ws: ServerWebSocket<WebSocketData>, message: any) => void> = {
  CREATE_ROOM: (ws) => {
    const player: Player = {
      username: ws.data.username,
      ipAddress: ws.remoteAddress,
    };
    const roomId = rm.createRoom(player);
    if (roomId) {
      console.log(`${ws.data.username} created the room ${roomId}`);
      ws.subscribe(`roomId:${roomId}`);
      ws.send(`Room created successfully: ${roomId}`);
    } else {
      ws.send('Room creation failed');
    }
  },
  JOIN_ROOM: (ws, message: { roomId: string }) => {
    const roomId = message.roomId;
    const player: Player = {
      username: ws.data.username,
      ipAddress: ws.remoteAddress,
    };
    const success = rm.joinRoom(roomId, player);
    if (success) {
      ws.subscribe(`roomId:${roomId}`);
      ws.publish(`roomId:${roomId}`, `${ws.data.username} joined the room`);
    } else {
      ws.send('Join room failed');
    }
  },
  LEAVE_ROOM: (ws, message: { roomId: string }) => {
    const roomId = message.roomId;
    const player: Player = {
      username: ws.data.username,
      ipAddress: ws.remoteAddress,
    };
    const success = rm.leaveRoom(roomId, player);
    if (success) {
      ws.publish(`roomId:${roomId}`, `${ws.data.username} left the room`);
      ws.unsubscribe(`roomId:${roomId}`);
    } else {
      ws.send('Leave room failed');
    }
  },
  START_GAME: (ws, message: { roomId: string }) => {
    const roomId = message.roomId;
    const room = rm.getRoom(roomId);
    if (!room) {
      ws.send('Room not found');
      return;
    }
    if (room.host.username === ws.data.username) {
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