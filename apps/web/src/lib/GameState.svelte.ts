import { SvelteSet, SvelteURL } from "svelte/reactivity";
import { CRY_URL, MAX_PARTY_SIZE, type Pokemon } from "./pokemon";
import { GameClockState } from "./GameClockState.svelte";
import { TurnState } from "./TurnState.svelte";

export type PlayerType = 'PLAYER' | 'OPPONENT';
export type PlayerStatus = 'PRE_DRAFT' | 'ACTIVE' | 'INACTIVE' | 'COMPLETE';
export type Side = 'LEFT' | 'RIGHT';
export interface Player { 
  playerType: PlayerType;
  username: string;
  status: PlayerStatus;
  side: Side;
  party: Pokemon[];
  initiative: 0 | 1;
}

export class GameState {
  private _player = $state<Player>({
    playerType: 'PLAYER',
    username: 'Player 1',
    status: 'PRE_DRAFT',
    side: 'LEFT',
    party: [],
    initiative: 0
  });
  private _opponent = $state<Player>({
    playerType: 'OPPONENT',
    username: 'Player 2',
    status: 'PRE_DRAFT',
    side: 'RIGHT',
    party: [],
    initiative: 1
  });
  private pokemonPool: Pokemon[] = [];
  turn = new TurnState();

  player = $derived<Readonly<Player>>({...this._player} as const);
  opponent = $derived<Readonly<Player>>({...this._opponent} as const);
  draftedPokemon = $derived.by(() => {
    const draftedIds = this.player.party.concat(this.opponent.party).map(pokemon => pokemon.id);
    return new SvelteSet(draftedIds);
  });

  clock = new GameClockState();

  startGame(pool: Pokemon[]) {
    this.pokemonPool = pool;

    this.turn.startNextTurn('');
    this.clock.start({
      turnType: 'PRE_DRAFT',
      onTimeout: () => {
        this.endTurn();

        this._player = { ...this._player, status: this.getInitialDraftStatus(this._player) };
        this._opponent = { ...this._opponent, status: this.getInitialDraftStatus(this._opponent) };

        this.startTurn();
      }
    });
  }

  startTurn() {
    const activePlayer = this.getPlayersByStatus().activePlayer;
    if (!activePlayer) {
      console.log('No active player, cannot start turn');
      this.endGame();
      return;
    }

    console.log('Starting turn for:', activePlayer.username);
    this.turn.startNextTurn(activePlayer.username);

    // Start new timer for the active player's turn
    console.log('new start turn', this.turn.turnType);
    this.clock.start({
      turnType: this.turn.turnType,
      onTimeout: () => {
        console.log('Timer timeout for turn:', this.turn.turnType);
        const { activePlayer } = this.getPlayersByStatus();
        if (!activePlayer) return;
        
        // If no pokemon was selected, give random pokemon
        if (this.turn.selectedPokemon === null) {
          const randomPokemon = this.getRandomPokemon();
          this.addToParty(activePlayer.playerType, randomPokemon);
        } else {
          this.endTurn();
        }
      }
    });
  }

  endTurn() {
    this.turn.endTurn();

    const { activePlayer, inactivePlayer } = this.getPlayersByStatus();
    if (activePlayer) {
      activePlayer.status = activePlayer.party.length === MAX_PARTY_SIZE ? 'COMPLETE' : 'INACTIVE';
    }
    if (inactivePlayer) {
      inactivePlayer.status = 'ACTIVE';
    }

    if (this.turn.totalTurnsLeft > 0) {
      this.startTurn();
    }
  }

  endGame() {
    this.clock.stop();
    this.turn.startNextTurn(); // In this case, next turn is POST_DRAFT
  }

  
  addToParty(playerType: 'PLAYER' | 'OPPONENT', pokemon: Pokemon) {
    const player = playerType === 'PLAYER' ? this._player : this._opponent;

    this.pushToParty(player, pokemon);
    this.playCry(pokemon);
    this.turn.selectedPokemon = pokemon;
    this.pokemonPool = [...this.pokemonPool].filter(p => p.id !== pokemon.id);

    this.endTurn();
  }

  private pushToParty(player: Player, pokemon: Pokemon) {
    player.party.push(pokemon);
  }

  private removeFromParty(player: Player, pokemon: Pokemon) {
    player.party = player.party.filter(p => p.id !== pokemon.id);
  }

  private getRandomPokemon() {
    return this.pokemonPool[Math.floor(Math.random() * this.pokemonPool.length)];
  }

  private getPlayersByStatus(): {
    activePlayer: Player | null;
    inactivePlayer: Player | null;
    completedPlayers: Player[] | null;
    preDraftPlayers: Player[] | null;
  } {
    const filterByStatus = (status: PlayerStatus): Player[] | null => 
      [this._player, this._opponent].filter(player => player.status === status) ?? null;
    const activePlayer: Player | null = filterByStatus('ACTIVE')?.[0] ?? null;
    const inactivePlayer: Player | null = filterByStatus('INACTIVE')?.[0] ?? null;
    const completedPlayers: Player[] | null = activePlayer && inactivePlayer ? null : filterByStatus('COMPLETE');
    const preDraftPlayers: Player[] | null = activePlayer && inactivePlayer ? null : filterByStatus('PRE_DRAFT');
    return { activePlayer, inactivePlayer, completedPlayers, preDraftPlayers };
  }

  private playCry(pokemon: Pokemon) {
    const cry = new SvelteURL(`${CRY_URL}/${pokemon.id}.ogg`, import.meta.url).href;
    const audio = new Audio(cry);
    audio.volume = 0.33;
    audio.play();
  }

  private getInitialDraftStatus(player: Player) {
    if (player.initiative === 0) {
      return 'ACTIVE';
    }
    return 'INACTIVE';
  }

}
export const gameState = new GameState();