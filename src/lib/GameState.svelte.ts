import { SvelteSet } from "svelte/reactivity";
import { MAX_PARTY_SIZE, type Pokemon } from "./pokemon";

export type PlayerType = 'PLAYER' | 'OPPONENT';
export type PlayerStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETE';
export type Side = 'LEFT' | 'RIGHT';
export interface Player {
  playerType: PlayerType;
  username: string;
  status: PlayerStatus;
  side: Side;
  party: Pokemon[];
}

export class GameState {
  private _player = $state<Player>({
    playerType: 'PLAYER',
    username: 'Player 1',
    status: 'ACTIVE',
    side: 'LEFT',
    party: []
  });
  private _opponent = $state<Player>({
    playerType: 'OPPONENT',
    username: 'Player 2',
    status: 'INACTIVE',
    side: 'RIGHT',
    party: []
  });

  player = $derived<Readonly<Player>>({...this._player} as const);
  opponent = $derived<Readonly<Player>>({...this._opponent} as const);
  draftedPokemon = $derived.by(() => {
    const draftedIds = this.player.party.concat(this.opponent.party).map(pokemon => pokemon.id);
    return new SvelteSet(draftedIds);
  });

  
  addToParty(playerType: 'PLAYER' | 'OPPONENT', pokemon: Pokemon) {
    const player = playerType === 'PLAYER' ? this._player : this._opponent;
    this.pushToParty(player, pokemon);
    if (player.party.length >= MAX_PARTY_SIZE) {
      this._player.status = 'COMPLETE';
    }

  }
  private pushToParty(player: Player, pokemon: Pokemon) {
    player.party.push(pokemon);
  }
  private removeFromParty(player: Player, pokemon: Pokemon) {
    player.party = player.party.filter(p => p.id !== pokemon.id);
  }

}
export const gameState = new GameState();