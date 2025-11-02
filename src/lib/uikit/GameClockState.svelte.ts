export type TURN_TYPES = 'PRE_DRAFT' | 'DRAFT' | 'POST_DRAFT';

export interface TurnChangeParams {
  prevTurn: TURN_TYPES;
  newTurn: TURN_TYPES;
  timeRemaining: number;
}

export const TIME_LIMIT = {
  PRE_DRAFT: 30,
  DRAFT: 30,
  POST_DRAFT: -Infinity
} as const;

export const TURN_COUNT = {
  PRE_DRAFT: 1,
  DRAFT: 12,
  POST_DRAFT: 1
};

const TIMEOUT_DELAY = 1000;

export class GameClockState {
  private _timeRemaining = $state<number>(TIME_LIMIT['PRE_DRAFT']);
  private _timer = $state<NodeJS.Timeout>();

  timeRemaining = $derived(this._timeRemaining);
  currentTurn = $state<TURN_TYPES>('PRE_DRAFT');
  remainingTurns = $state({ ...TURN_COUNT });
  
  constructor(onTurnChange: typeof this.onTurnChange) {
    this.onTurnChange = onTurnChange;
  }

  start() {
    this._timeRemaining = TIME_LIMIT[this.currentTurn];
    this._timer = setInterval(() => {
      this._timeRemaining--;
      if (this._timeRemaining <= -1) {
        const prevTurn = this.currentTurn;
        this.remainingTurns = {
          ...this.remainingTurns,
          [this.currentTurn]: this.remainingTurns[this.currentTurn] - 1,
        };
        this.currentTurn = this.getNextTurn(this.currentTurn, this.remainingTurns);
        this._timeRemaining = TIME_LIMIT[this.currentTurn];

        this.onTurnChange({ prevTurn, newTurn: this.currentTurn, timeRemaining: this._timeRemaining });

        if (this.currentTurn === 'POST_DRAFT') {
          this.stop();
        }

      }
    }, TIMEOUT_DELAY);
  }

  clearRemainingTime(): void {
    this._timeRemaining = 0;
  }
  
  stop(): void {
    clearInterval(this._timer);
    this._timeRemaining = 0;
  }

  pause(): void {
    clearInterval(this._timer);
  }
  resume() {
    this.start();
  }

  private onTurnChange: (params: TurnChangeParams) => void;

  private getNextTurn(currentTurn: TURN_TYPES, turns: Record<TURN_TYPES, number>): TURN_TYPES {
		if (currentTurn === 'PRE_DRAFT' && turns[currentTurn] === 0) {
			return 'DRAFT';
		}
		if (currentTurn === 'DRAFT' && turns[currentTurn] === 0) {
			return 'POST_DRAFT';
		}
		return currentTurn;
	}
}
