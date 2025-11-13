import type { SensitivePlayer as Player } from "./player";

export class Engine {
  private readonly players: Record<string, Player> = {} as const;

  constructor(players: Player[]) {
    this.players = players.reduce((acc, player) => {
      acc[player.userId] = player;
      return acc;
    }, {} as Record<string, Player>);
  }

  static start(players: Player[]) {
    console.log('Starting game with players:', players.map((p) => p.username));
    return new Engine(players);
  }
}
