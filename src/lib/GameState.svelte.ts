import { SvelteSet, SvelteURL } from "svelte/reactivity";
import { CRY_URL, MAX_PARTY_SIZE, type Pokemon } from "./pokemon";
import { GameClockState } from "./uikit/GameClockState.svelte";

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

interface TurnState {
  activePlayer: Player;
  turnNumber: number;
  selectedPokemon: Pokemon | null;
  turnTimeRemaining: number;
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
  private turnState = $state<TurnState>({
    activePlayer: this._player,
    turnNumber: 0,
    selectedPokemon: null,
    turnTimeRemaining: 0
  });

  player = $derived<Readonly<Player>>({...this._player} as const);
  opponent = $derived<Readonly<Player>>({...this._opponent} as const);
  draftedPokemon = $derived.by(() => {
    const draftedIds = this.player.party.concat(this.opponent.party).map(pokemon => pokemon.id);
    return new SvelteSet(draftedIds);
  });
  clock = new GameClockState(({ prevTurn, newTurn, timeRemaining }) => {
    const isFirstTurn = prevTurn === 'PRE_DRAFT' && newTurn === 'DRAFT';
    if (isFirstTurn) {
      this._player.status = this.initialDraftStatus(this._player);
      this._opponent.status = this.initialDraftStatus(this._opponent);
      return;
    }
    if (prevTurn === 'DRAFT') {
      const { activePlayer } = this.getPlayersByStatus();
      if (!activePlayer) return;
      // if active player did not draft a pokemon, give them a random pokemon
      if (this.turnState.selectedPokemon === null) {
        const randomPokemon = this.getRandomPokemon();
        this.addToParty(activePlayer.playerType, randomPokemon, timeRemaining);
      }
    }
  });

  constructor() {
  }


  startGame(pool: Pokemon[]) {
    this.pokemonPool = pool;
    this.clock.start();
  }

  startTurn() {
    this.clock.start();
    const activePlayer = this.getPlayersByStatus().activePlayer;
    if (!activePlayer) return;

    this.turnState.activePlayer = activePlayer;
    this.turnState.turnNumber++;
    this.turnState.selectedPokemon = null;
    this.turnState.turnTimeRemaining = 30;
  }

  endTurn() {
    this.clock.stop();

    const { activePlayer, inactivePlayer } = this.getPlayersByStatus();

    if (activePlayer) {
      activePlayer.status = activePlayer.party.length === MAX_PARTY_SIZE ? 'COMPLETE' : 'INACTIVE';
    }
    if (inactivePlayer) {
      inactivePlayer.status = 'ACTIVE';
    }

    this.startTurn();
  }

  
  addToParty(playerType: 'PLAYER' | 'OPPONENT', pokemon: Pokemon, timeRemaining: number) {
    const player = playerType === 'PLAYER' ? this._player : this._opponent;

    this.pushToParty(player, pokemon);
    this.playCry(pokemon);

    this.turnState.selectedPokemon = pokemon;
    this.turnState.turnTimeRemaining = timeRemaining;

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

  private initialDraftStatus(player: Player) {
    if (player.initiative === 0) {
      return 'ACTIVE';
    }
    return 'INACTIVE';
  }

}
export const gameState = new GameState();