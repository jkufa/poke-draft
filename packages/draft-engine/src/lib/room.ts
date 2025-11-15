import humanId from "human-id";
import { Engine } from "./engine";
import { SensitivePlayer as Player } from "./player";

const LOBBY_LIMIT = 2;
const ROOM_TIMEOUT_MS = 180000; // 3 minutes
const ROOM_IDLE_TIMEOUT_MS = 180000; // 3 minutes

class Room {
  id: string;
  players: Player[];
  engine!: Engine;
  #host: Player;

  constructor(id: string, host: Player) {
    if (host.type !== 'HOST') {
      throw new Error('first player must be a host!');
    }
    this.id = id;
    this.players = [host];
    this.#host = host;
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  removePlayer(player: Player) {
    this.players = this.players.filter((p) => p.userId !== player.userId);
  }

  updatePlayer(player: Partial<Player> & { userId: string }) {
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

  getHost() {
    return this.#host;
  }


  getPlayerIndex(userId: string) {
    return this.players.findIndex((p) => p.userId === userId);
  }

  startGame() {
    this.engine = Engine.start(this.players);
  }
}

class RoomManager {
  private readonly rooms = new Map<string, Room>();
  private readonly timeoutIds = new Map<string, NodeJS.Timeout>();

  createRoom(player: Player) {
    const roomId = this.generateRoomId();
    const room = new Room(roomId, player);
    this.rooms.set(roomId, room);
    return roomId;
  }

  joinRoom(roomId: string, player: Player) {
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
    const timeoutId = this.timeoutIds.get(roomId);
    if (timeoutId) {
      console.log(`Room ${roomId} was going to be deleted, cancelling timeout`);
      clearTimeout(timeoutId);
      this.timeoutIds.delete(roomId);
    }
    room.players.push(player);
    return true;
  }

  leaveRoom(roomId: string, player: Player) {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return false;
    }
    room.players = room.players.filter((p) => p.userId !== player.userId);
    if (room.players.length === 0) {
      console.log(`Room ${roomId} is empty, deleting in ${ROOM_TIMEOUT_MS}ms`);
      this.timeoutIds.set(roomId, setTimeout(() => {
        this.deleteRoom(roomId);
      }, ROOM_TIMEOUT_MS));
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

  private generateRoomId(): string {
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