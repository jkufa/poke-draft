import { ClientPlayer } from "@repo/draft-engine";
import { message, z } from "@ws-kit/zod";
import { maxLength } from "human-id";

export const RoomId = z.string().max(maxLength())

export const CreateRoom = message('CREATE_ROOM');
export const CreateRoomSuccess = message('CREATE_ROOM_SUCCESS', {
  roomId: RoomId,
  users: z.array(ClientPlayer)
});

export const JoinRoom = message('JOIN_ROOM', {
  roomId: RoomId,
});
export const JoinRoomSuccess = message('JOIN_ROOM_SUCCESS', {
  roomId: RoomId,
  users: z.array(ClientPlayer)
});

export const LeaveRoom = message('LEAVE_ROOM', {
  roomId: RoomId,
});
export const LeaveRoomSuccess = message('LEAVE_ROOM_SUCCESS', {
  roomId: RoomId,
  users: z.array(ClientPlayer),
});