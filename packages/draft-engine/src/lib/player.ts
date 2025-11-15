import { z } from "zod";
import { Pokemon } from "./pokemon";

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

export const PlayerStatus = z.enum(['PRE_DRAFT', 'ACTIVE', 'INACTIVE', 'COMPLETE']);
export type PlayerStatus = z.infer<typeof PlayerStatus>;

export const PlayerType = z.enum(['HOST', 'GUEST']);
export type PlayerType = z.infer<typeof PlayerType>;


const BasePlayer = z.object({
  userId: z.string(),
  type: PlayerType,
  username: z.string().optional(),
  gameInfo: z.object({
    status: PlayerStatus,
    party: z.array(Pokemon),
    initiative: z.literal(0).or(z.literal(1)),
  }).optional(),
});
type BasePlayer = z.infer<typeof BasePlayer>;

export const ClientPlayer = BasePlayer;
export type ClientPlayer = z.infer<typeof ClientPlayer>;

export const SensitivePlayer = BasePlayer.extend({
  ipAddress: z.string(),
});
export type SensitivePlayer = z.infer<typeof SensitivePlayer>;


export function toClientPlayer(player: SensitivePlayer): ClientPlayer {
  const { ipAddress, ...clientPlayer } = player;
  return clientPlayer;
}