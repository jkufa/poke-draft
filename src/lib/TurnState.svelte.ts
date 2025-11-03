import type { Pokemon } from "$lib/pokemon";

export type TurnType = 'PRE_DRAFT' | 'DRAFT' | 'POST_DRAFT';

export interface TurnChangeParams {
  prevTurn: TurnType;
  newTurn: TurnType;
}

export const TURN_COUNT_CONFIG = {
  PRE_DRAFT: {
    count: 1,
    nextTurnType: 'DRAFT',
  },
  DRAFT: {
    count: 12,
    nextTurnType: 'POST_DRAFT',
  },
  POST_DRAFT: {
    count: 1,
    nextTurnType: 'PRE_DRAFT',
  }
} as const;


export interface Turn {
  playerName: string;
  turnNumber: number;
  turnType: TurnType;
  turnsLeft: Record<TurnType, number>;
}
export interface TurnAudit extends Turn {
  selectedPokemon: Pokemon | null;
}

const BASE_TURN = {
  playerName: '',
  turnNumber: 0,
  turnType: 'PRE_DRAFT',
  turnsLeft: {
    PRE_DRAFT: TURN_COUNT_CONFIG.PRE_DRAFT.count,
    DRAFT: TURN_COUNT_CONFIG.DRAFT.count,
    POST_DRAFT: TURN_COUNT_CONFIG.POST_DRAFT.count,
  },
} satisfies Turn;

export class TurnState {
  private currentTurn = $state<Turn>({ ...BASE_TURN });
  private _turnAudit = $state<TurnAudit[]>([]);

  turnType = $derived(this.currentTurn.turnType);
  turnNumber = $derived(this.currentTurn.turnNumber);
  selectedPokemon = $state<Pokemon | null>(null);
  totalTurnsLeft = $derived(Object.values(this.currentTurn.turnsLeft).reduce((acc, curr) => acc + curr, 0));
  turnAudit = $derived([...this._turnAudit] as const);

  constructor(onTurnChange: (params: TurnChangeParams) => void) {
    this.onTurnChange = onTurnChange;
  }

  startNewTurn(playerName = '') {
    const { turnNumber, turnsLeft } = this.currentTurn;
    const prevTurnType = this.currentTurn.turnType;
    const newTurnsLeft = {
      ...turnsLeft,
      [prevTurnType]: turnsLeft[prevTurnType] - 1,
    };
    const newTurnType = this.getNextTurnType(prevTurnType, newTurnsLeft);


    this.onTurnChange({
      prevTurn: prevTurnType,
      newTurn: newTurnType,
    });

    this.selectedPokemon = null;
    this.currentTurn = {
      playerName,
      turnNumber: turnNumber + 1,
      turnType: newTurnType,
      turnsLeft: newTurnsLeft,
     };
  }

  endTurn() {
    this._turnAudit.push({ ...this.currentTurn, selectedPokemon: this.selectedPokemon });
  }

  private onTurnChange: (params: TurnChangeParams) => void;

  private getNextTurnType(currentTurnType: TurnType, turnsLeft: Record<TurnType, number>): TurnType {
    if (turnsLeft[currentTurnType] === 0) {
      return TURN_COUNT_CONFIG[currentTurnType].nextTurnType;
    }
    return currentTurnType;
  }

}
