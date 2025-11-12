import type { Pokemon } from "$lib/pokemon";

export type TurnType = 'NONE' | 'PRE_DRAFT' | 'DRAFT' | 'POST_DRAFT';

export interface TurnChangeParams {
  prevTurn: TurnType;
  newTurn: TurnType;
}

export const TURN_COUNT_CONFIG = {
  NONE: {
    count: 0,
    nextTurnType: 'PRE_DRAFT',
  },
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
  turnType: 'NONE',
  turnsLeft: {
    NONE: TURN_COUNT_CONFIG.NONE.count,
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

  startNextTurn(playerName = '') {
    const { turnNumber, turnsLeft, turnType } = this.currentTurn;

    const newTurnType = this.getNextTurnType(turnType, turnsLeft);
    const newTurnsLeft = {
      ...turnsLeft,
      [newTurnType]: this.getTurnsLeft(newTurnType, turnsLeft),
    };


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

  private getTurnsLeft(turnType: TurnType, turnsLeft: Record<TurnType, number>): number {
    if (turnType === 'NONE') {
      return 0;
    }
    return turnsLeft[turnType] - 1;
  }

  private getNextTurnType(currentTurnType: TurnType, turnsLeft: Record<TurnType, number>): TurnType {
    if (turnsLeft[currentTurnType] === 0) {
      return TURN_COUNT_CONFIG[currentTurnType].nextTurnType;
    }
    return currentTurnType;
  }

}
