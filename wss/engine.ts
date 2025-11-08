export type PlayerType = 'PLAYER' | 'OPPONENT';
export type PlayerStatus = 'PRE_DRAFT' | 'ACTIVE' | 'INACTIVE' | 'COMPLETE';
export type Side = 'LEFT' | 'RIGHT';
export interface Pokemon {
  id: number;
  name: string;
}
export interface Player {
  // playerType: PlayerType;
  username: string;
  // status: PlayerStatus;
  // side: Side;
  // party: Pokemon[];
  // initiative: 0 | 1;
}

export class Engine {
  private readonly players: Record<string, Player> = {} as const;

  constructor(players: Player[]) {
    this.players = players.reduce((acc, player) => {
      acc[player.username] = player;
      return acc;
    }, {} as Record<string, Player>);
  }

  static start(players: Player[]) {
    console.log('Starting game with players:', players.map((p) => p.username));
    return new Engine(players);
  }
}
