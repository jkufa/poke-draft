import humanId from "human-id";
import { Engine } from "./engine";
import { BasePlayer } from "./player";

const LOBBY_LIMIT = 2;

class Room {
  id: string;
  players: BasePlayer[];
  engine: Engine;
  host: BasePlayer;

  constructor(id: string, host: BasePlayer) {
    this.id = id;
    this.players = [host];
    this.host = host;
  }

  addPlayer(player: BasePlayer) {
    this.players.push(player);
  }

  removePlayer(player: BasePlayer) {
    this.players = this.players.filter((p) => p.userId !== player.userId);
  }

  updatePlayer(player: Partial<BasePlayer> & { userId: string }) {
    const playerIndex = this.getPlayerIndex(player.userId);
    this.players[playerIndex] = { ...this.players[playerIndex], ...player };
    return this.players[playerIndex];
  }

  getPlayer(userId: string) {
    const index = this.getPlayerIndex(userId);
    if (index === -1) {
      console.error(`Player ${userId} not found`);
      return null;
    }
    return this.players[index];
  }

  getPlayerIndex(userId: string) {
    return this.players.findIndex((p) => p.userId === userId);
  }

  startGame() {
    this.engine = Engine.start(this.players);
  }
}

class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(player: BasePlayer) {
    const roomId = this.generateRoomId();
    const room = new Room(roomId, player);
    this.rooms.set(roomId, room);
    return roomId;
  }

  joinRoom(roomId: string, player: BasePlayer) {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return false;
    }
    if (room.players.length >= LOBBY_LIMIT) {
      console.error(`Room ${roomId} is full!`);
      return false;
    }
    if (room.players.some((p) => p.userId === player.userId)) {
      console.error(`Player ${player.userId} already in room ${roomId}`);
      return false;
    }
    room.players.push(player);
    return true;
  }

  leaveRoom(roomId: string, player: BasePlayer) {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return false;
    }
    room.players = room.players.filter((p) => p.userId !== player.userId);
    if (room.players.length === 0) {
      this.deleteRoom(roomId);
      return true;
    }
    console.log(`Player ${player.userId} left room ${roomId}`);
    return true;
  }

  deleteRoom(roomId: string) {
    this.rooms.delete(roomId);
    console.log(`Deleted room ${roomId}`);
    return true;
  }

  getRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return null;
    }
    return room;
  }

  private generateRoomId() {
    const id = humanId();
    if (this.rooms.has(id)) {
      console.error(`Room ID clash: ${id} already exists`);
      return this.generateRoomId();
    }
    return id;
  }
}
export type IRoomManager = InstanceType<typeof RoomManager>;
export const roomManager = new RoomManager();