import { createRouter } from "@ws-kit/zod";
import { ConnectionMetadata } from "../../metadata";
import * as actions from "./actions";
import * as schema from "./events";

export const roomRouter = createRouter<ConnectionMetadata>();

roomRouter.on(schema.CreateRoom, actions.createRoom);
roomRouter.on(schema.JoinRoom, actions.joinRoom);
roomRouter.on(schema.LeaveRoom, actions.leaveRoom);
