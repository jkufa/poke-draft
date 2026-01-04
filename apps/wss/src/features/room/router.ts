import { createRouter } from "@ws-kit/zod";
import { ConnectionMetadata } from "../../metadata";
import * as actions from "./actions";
import { CreateRoom, JoinRoom, LeaveRoom } from "@repo/websocket";

export const roomRouter = createRouter<ConnectionMetadata>();

roomRouter.on(CreateRoom, actions.createRoom);
roomRouter.on(JoinRoom, actions.joinRoom);
roomRouter.on(LeaveRoom, actions.leaveRoom);