import type { Pokemon } from "./pokemon";

/**
 * We need two versions of player
 * 1. Internal, serverside version: Contains sensitive data like ip address
 * 2. External, clientside version: Contains only public data like username
 * 
 * Phase 1: Joining a room
 *     - Just need to know username + userId
 * Phase 2: Game starts
 *     - Need to know username + userId + party + initiative
 * Phase 3: Game ends
 *     - Need to know username + userId + party + initiative
 * 
 * Can I group game info into a single object?
 */

export interface SensitivePlayerData {
  ipAddress: string;
}

export type PlayerStatus = 'PRE_DRAFT' | 'ACTIVE' | 'INACTIVE' | 'COMPLETE';
export type PlayerType = 'HOST' | 'GUEST';

export interface BasePlayer {
  userId: string;
  type: PlayerType;
  username?: string;
  gameInfo?: {
    status: PlayerStatus;
    party: Pokemon[];
    initiative: 0 | 1;
  }
}
export interface ClientPlayer extends BasePlayer {}

interface ISensitivePlayer extends BasePlayer, SensitivePlayerData {}
export class SensitivePlayer implements ISensitivePlayer {
  userId: string;
  ipAddress: string;
  type: PlayerType;
  username?: string;
  gameInfo?: {
    status: PlayerStatus;
    party: Pokemon[];
    initiative: 0 | 1;
  }

  constructor(data: ISensitivePlayer) {
    Object.assign(this, data);
  }

  static toClient(player: ISensitivePlayer): ClientPlayer {
    const { ipAddress, ...clientPlayer } = player;
    return clientPlayer;
  }
}