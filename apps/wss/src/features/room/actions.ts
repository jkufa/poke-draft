import { MessageHandler, MessageSchemaType } from "@ws-kit/zod";
import { roomManager as rm, toClientPlayer, toClientPlayers } from '@repo/draft-engine';
import { ConnectionMetadata } from "../../metadata";
import { CreateRoom, JoinRoom, LeaveRoom, CreateRoomSuccess, RoomId, LeaveRoomSuccess, JoinRoomSuccess } from "@repo/websocket";
import { SensitivePlayer } from "../../../../../packages/draft-engine/src";
import { getTopic } from "../../../../../packages/websocket/src/lib/shared/get-topic";

type Action<T extends MessageSchemaType> = MessageHandler<T, ConnectionMetadata>;

const TOPIC_PREFIX = 'roomId:';

export const createRoom: Action<typeof CreateRoom> = async ({ ws, error, send, publish }) => {
  const player: SensitivePlayer = {
    userId: ws.data.userId,
    type: 'HOST',
    ipAddress: '', // TODO: get ip address from metadata
  }

  const room = rm.createRoom(player);

  const topic = getTopic(TOPIC_PREFIX, room.id);
  ws.subscribe(topic);
  ws.data.subscriptions.add(topic);
  console.log('Sending CreateRoomSuccess', {
    roomId: room.id,
    users: toClientPlayers(room.getAllPlayers()),
  });
  publish(topic, CreateRoomSuccess, {
    roomId: room.id,
    users: toClientPlayers(room.getAllPlayers()),
  });
  return send(CreateRoomSuccess, {
    roomId: room.id,
    users: toClientPlayers(room.getAllPlayers()),
  })
}

export const joinRoom: Action<typeof JoinRoom> = async ({ ws, error, send, payload, publish }) => {
  const { roomId } = payload;

  if (!RoomId.safeParse(roomId).success) {
    return error('INVALID_ARGUMENT', 'Invalid room ID');
  }

  const room = rm.getRoom(roomId);
  if (!room) {
    return error('NOT_FOUND', 'Room not found');
  }
  const existingPlayer = room.getPlayer(ws.data.userId);

  const player: SensitivePlayer = existingPlayer ?? {
    userId: ws.data.userId,
    type: 'GUEST',
    ipAddress: '', // TODO: get ip address from metadata
  }
  room.addPlayer(player);

  const topic = getTopic(TOPIC_PREFIX, roomId);
  ws.subscribe(topic);
  ws.data.subscriptions.add(topic);

  publish(topic, JoinRoomSuccess, {
    roomId: roomId,
    users: toClientPlayers(room.getAllPlayers()),
  });
  return send(JoinRoomSuccess, {
    roomId: roomId,
    users: toClientPlayers(room.getAllPlayers()),
  });
}

export const leaveRoom: Action<typeof LeaveRoom> = async (ctx) => {
  const { roomId } = ctx.payload;

  if (!RoomId.safeParse(roomId).success) {
    return ctx.error('INVALID_ARGUMENT', 'Invalid room ID');
  }

  const room = rm.getRoom(roomId);
  if (!room) {
    return ctx.error('NOT_FOUND', 'Room not found');
  }

  const player = room.getPlayer(ctx.ws.data.userId);
  if (!player) {
    return ctx.error('NOT_FOUND', 'Player not found');
  }

  rm.leaveRoom(roomId, player);
  return ctx.send(LeaveRoomSuccess, {
    roomId: roomId,
    users: toClientPlayers(room.getAllPlayers()),
  });
}