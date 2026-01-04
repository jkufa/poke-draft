import { MessageHandler, MessageSchemaType, z } from "@ws-kit/zod";
import { roomManager as rm, toClientPlayers, SensitivePlayer } from '@repo/draft-engine';
import { CreateRoom, JoinRoom, LeaveRoom, CreateRoomSuccess, RoomId, LeaveRoomSuccess, JoinRoomSuccess } from "@repo/websocket";
import { getTopic } from "@repo/websocket";
import { ConnectionMetadata } from "../../metadata";

type Action<T extends MessageSchemaType> = MessageHandler<T, ConnectionMetadata>;

const TOPIC_PREFIX = 'roomId';

export const createRoom: Action<typeof CreateRoom> = async (ctx) => {
  const player: SensitivePlayer = {
    userId: ctx.ws.data.userId,
    type: 'HOST',
    ipAddress: '', // TODO: get ip address from metadata
  }

  const room = rm.createRoom(player);
  const topic = getTopic(TOPIC_PREFIX, room.id);
  const payload = {
    roomId: room.id,
    users: toClientPlayers(room.getAllPlayers()),
  };

  ctx.subscribe(topic);
  ctx.ws.subscribe(topic);
  ctx.ws.data.subscriptions.add(topic);
  ctx.publish(topic, CreateRoomSuccess, payload);

  return ctx.send(CreateRoomSuccess, payload);
}

export const joinRoom: Action<typeof JoinRoom> = async (ctx) => {
  const { roomId } = ctx.payload;

  if (!RoomId.safeParse(roomId).success) {
    return ctx.error('INVALID_ARGUMENT', 'Invalid room ID');
  }

  const room = rm.getRoom(roomId);
  if (!room) {
    return ctx.error('NOT_FOUND', 'Room not found');
  }

  const topic = getTopic(TOPIC_PREFIX, roomId);


  const host = room.getHost();
  // Host is rejoining the room
  if (host.userId === ctx.ws.data.userId) {
    room.addPlayer(host);
    const payload = { roomId, users: toClientPlayers(room.getAllPlayers()) };
    ctx.publish(topic, JoinRoomSuccess, payload);
    return ctx.send(JoinRoomSuccess, payload);
  }

  const player: SensitivePlayer = {
    userId: ctx.ws.data.userId,
    type: 'GUEST',
    ipAddress: '', // TODO: get ip address from metadata
  }
  room.addPlayer(player);

  const payload = { roomId, users: toClientPlayers(room.getAllPlayers()) };
  ctx.subscribe(topic);
  ctx.ws.data.subscriptions.add(topic);

  ctx.publish(topic, JoinRoomSuccess, payload);
  return ctx.send(JoinRoomSuccess, payload);
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