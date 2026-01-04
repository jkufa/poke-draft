import { EventEmitter } from "events";
import { LogEntry, LogEvent, LogLevel, LOG_LEVELS } from "./log-manager";

/**
 * Event logger class.
 */
export class Logger {
  #emitter: EventEmitter;
  #minLevel: number;
  #module: string;

  constructor(emitter: EventEmitter, module: string, minLevel: string) {
    this.#emitter = emitter;
    this.#module = module;
    this.#minLevel = this.#levelToInt(minLevel);
  }

  /**
   * Converts a string level (trace/debug/info/warn/error) into a number 
   * 
   * @param minLevel 
   */
  #levelToInt(minLevel: string): number {
    if (minLevel.toLowerCase() in LOG_LEVELS)
      return LOG_LEVELS[minLevel.toLowerCase()];
    else
      return LOG_LEVELS.none;
  }

  /**
   * Central logging method.
   * @param logLevel
   * @param event
   */
  log(logLevel: LogLevel, event: LogEvent): void {
    const level = this.#levelToInt(logLevel);
    if (level < this.#minLevel) return;

    const logEntry: LogEntry = { level: logLevel, module: this.#module, event };

    const error = new Error('');
    if (error.stack) {
      const cla = error.stack.split('\n');
      let idx = 1;
      while (idx < cla.length && cla[idx].includes('at Logger.Object.')) idx++;
      if (idx < cla.length) {
        logEntry.location = (cla[idx].slice(cla[idx].indexOf('at ') + 3, cla[idx].length)).slice(3);
      }
    }

    this.#emitter.emit('log', logEntry);
  }

  trace(event: LogEvent) { this.log('trace', event); }
  debug(event: LogEvent) { this.log('debug', event); }
  info(event: LogEvent) { this.log('info', event); }
  warn(event: LogEvent) { this.log('warn', event); }
  error(event: LogEvent) { this.log('error', event); }
}