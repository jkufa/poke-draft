import { SvelteSet } from "svelte/reactivity";
import type { Pokemon } from "./pokemon";

export interface Player {
  playerType: 'PLAYER' | 'OPPONENT';
  username: string;
  status: 'ACTIVE' | 'INACTIVE';
  side: 'LEFT' | 'RIGHT';
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
    if (playerType === 'PLAYER') {
      console.log('adding to player party', pokemon.name);
      this.player.party.push(pokemon);
    } else {
      this.opponent.party.push(pokemon);
    }
  }
}
export const gameState = new GameState();