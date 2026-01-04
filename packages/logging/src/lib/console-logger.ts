import { LogEntry, LogListener } from "./log-manager";

export interface ConsoleLoggerOptions {
  prettyPrint?: boolean;
  colorize?: boolean; // TODO: Implement colorization
}

const DEFAULT_OPTIONS: ConsoleLoggerOptions = {
  prettyPrint: false,
  colorize: true
}


export const consoleLogger = (options: ConsoleLoggerOptions = DEFAULT_OPTIONS): LogListener => {
  const { prettyPrint, colorize } = options;
  return (logEntry: LogEntry) => {
    const { level, module, location, event } = logEntry;
    const eventMsg = JSON.stringify(event, null, prettyPrint ? 2 : undefined);
    const msg = `${location} [${level.toUpperCase()}: ${module}] ${eventMsg}`

    if (level === 'trace') return console.trace(msg);
    if (level === 'debug') return console.debug(msg);
    if (level === 'info') return console.info(msg);
    if (level === 'warn') return console.warn(msg);
    if (level === 'error') return console.error(msg);
    return console.log(msg);
  }
}