import { EventEmitter } from 'events';
import { Logger } from './logger';

export type LogEvent = Record<string, unknown>;
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'none';

export const LOG_LEVELS = {
  trace: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5,
  none: 99
} as const satisfies Record<LogLevel, number>;

export type LogListener = (logEntry: LogEntry) => void;

export interface LogEntry {
  level: LogLevel;
  module: string;
  location?: string;
  event: LogEvent;
}

export interface LogOptions {
  minLevels: { [module: string]: LogLevel }
}

export class LogManager {
  #emitter = new EventEmitter();
  #options: LogOptions = {
    minLevels: {
      '': 'info'
    }
  };

  configure(options: LogOptions): LogManager {
    this.#options = Object.assign({}, this.#options, options);
    return this;
  }

  getLogger(module: string): Logger {
    let minLevel = 'none';
    let match = '';

    for (const key in this.#options.minLevels) {
      if (module.startsWith(key) && key.length >= match.length) {
        minLevel = this.#options.minLevels[key];
        match = key;
      }
    }

    return new Logger(this.#emitter, module, minLevel);
  }

  onLogEntry(listener: LogListener): LogManager {
    this.#emitter.on('log', listener);
    return this;
  }

  registerListeners(...listeners: LogListener[]) {
    listeners.forEach(listener => this.onLogEntry(listener));
    return this;
  }
}

export const logging = new LogManager();