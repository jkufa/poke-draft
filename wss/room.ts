import { Engine } from "./engine";
import { Player } from "./player";

const LOBBY_LIMIT = 2;

class Room {
  id: string;
  players: Player[];
  engine: Engine;
  host: Player;

  constructor(id: string, host: Player) {
    this.id = id;
    this.players = [host];
    this.host = host;
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }
  removePlayer(player: Player) {
    this.players = this.players.filter((p) => p.username !== player.username);
  }

  startGame() {
    this.engine = Engine.start(this.players);
  }
}

class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(player: Player) {
    const roomId = RoomManager.generateRoomId(player.username);
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
    if (room.players.some((p) => p.username === player.username)) {
      console.error(`Player ${player.username} already in room ${roomId}`);
      return false;
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
    room.players = room.players.filter((p) => p.username !== player.username);
    if (room.players.length === 0) {
      this.deleteRoom(roomId);
      return true;
    }
    console.log(`Player ${player.username} left room ${roomId}`);
    return true;
  }

  deleteRoom(roomId: string) {
    this.rooms.delete(roomId);
    console.log(`Deleted room ${roomId}`);
    return true;
  }

  getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }

  static generateRoomId(username: string) {
    return username + '|' + crypto.randomUUID();
  }
}
export const roomManager = new RoomManager();