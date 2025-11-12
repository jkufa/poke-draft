import { type TurnType } from "./TurnState.svelte";

export const TIME_LIMIT = {
  PRE_DRAFT: 20,
  DRAFT: 20,
  POST_DRAFT: -Infinity
} as const;

const TIMEOUT_DELAY = 1000;

interface StartParams {
  turnType: TurnType;
  onTimeout: () => void;
}

export class GameClockState {
  private _timeRemaining = $state<number>(TIME_LIMIT['PRE_DRAFT']);
  private timerId = $state<NodeJS.Timeout | undefined>();

  timeRemaining = $derived(this._timeRemaining);
  currentTurnType = $state<TurnType>('PRE_DRAFT');
  
  /**
   * Starts the countdown timer
   * - Clears any existing timer first
   * - Uses setInterval to count down every second
   * - Calls onTimeout when timer reaches 0
   */
  start(params: StartParams) {
    this.clearTimer();

    const { turnType, onTimeout } = params;

    this.currentTurnType = turnType;
    this._timeRemaining = TIME_LIMIT[turnType];

    this.timerId = setInterval(() => {
      this._timeRemaining--;
      
      if (this._timeRemaining < 0) {
        this.stop();
        onTimeout();
      }
    }, TIMEOUT_DELAY);
  }
  
  /**
   * Completely stops the timer
   * - Clears the interval
   * - Resets time remaining to 0
   * - Cannot be resumed (must call start() again)
   */
  stop(): void {
    console.log('stopping timer', this._timeRemaining);
    this.clearTimer();
    this._timeRemaining = 0;
  }

  /**
   * Internal method to safely clear the timer
   * - Checks if timer exists before clearing
   * - Uses clearInterval (matches setInterval)
   * - Sets timer to undefined
   */
  private clearTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId); // Must match: setInterval → clearInterval
      this.timerId = undefined;
    }
  }
}
