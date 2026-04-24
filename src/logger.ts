import * as fs from 'fs';
import * as path from 'path';
import { Alert } from './alerts';

export type LogFormat = 'text' | 'json';

export interface LoggerOptions {
  filePath?: string;
  format?: LogFormat;
  silent?: boolean;
}

let options: LoggerOptions = {};
let writeStream: fs.WriteStream | null = null;

export function initLogger(opts: LoggerOptions): void {
  options = opts;

  if (opts.filePath) {
    const dir = path.dirname(opts.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    writeStream = fs.createWriteStream(opts.filePath, { flags: 'a' });
  }
}

export function formatAlert(alert: Alert): string {
  if (options.format === 'json') {
    return JSON.stringify({
      timestamp: alert.timestamp.toISOString(),
      severity: alert.severity,
      port: alert.event.port,
      type: alert.event.type,
      process: alert.event.process ?? null,
      pid: alert.event.pid ?? null,
      message: alert.message,
    });
  }

  const ts = alert.timestamp.toISOString();
  const sev = alert.severity.toUpperCase().padEnd(8);
  return `[${ts}] ${sev} ${alert.message}`;
}

export function logAlert(alert: Alert): void {
  const line = formatAlert(alert);

  if (!options.silent) {
    console.log(line);
  }

  if (writeStream) {
    writeStream.write(line + '\n');
  }
}

export function closeLogger(): void {
  if (writeStream) {
    writeStream.end();
    writeStream = null;
  }
  options = {};
}
