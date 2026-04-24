import { EventEmitter } from 'events';

export type NotificationChannel = 'console' | 'file' | 'callback';

export interface NotificationPayload {
  level: 'info' | 'warn' | 'critical';
  message: string;
  port: number;
  timestamp: Date;
  meta?: Record<string, unknown>;
}

export interface NotifierConfig {
  channels: NotificationChannel[];
  onNotify?: (payload: NotificationPayload) => void;
  throttleMs?: number;
}

const emitter = new EventEmitter();
let config: NotifierConfig = { channels: ['console'] };
const lastSent: Map<string, number> = new Map();

export function configureNotifier(cfg: NotifierConfig): void {
  config = { throttleMs: 1000, ...cfg };
  emitter.removeAllListeners('notify');
  if (cfg.onNotify) {
    emitter.on('notify', cfg.onNotify);
  }
}

function isThrottled(key: string): boolean {
  const throttleMs = config.throttleMs ?? 1000;
  const last = lastSent.get(key);
  if (last === undefined) return false;
  return Date.now() - last < throttleMs;
}

export function sendNotification(payload: NotificationPayload): boolean {
  const key = `${payload.port}:${payload.level}`;
  if (isThrottled(key)) return false;
  lastSent.set(key, Date.now());

  for (const channel of config.channels) {
    if (channel === 'console') {
      const prefix = payload.level === 'critical' ? '[CRITICAL]' : payload.level === 'warn' ? '[WARN]' : '[INFO]';
      console.log(`${prefix} ${payload.timestamp.toISOString()} port=${payload.port} ${payload.message}`);
    } else if (channel === 'callback') {
      emitter.emit('notify', payload);
    }
  }
  return true;
}

export function resetNotifier(): void {
  config = { channels: ['console'] };
  lastSent.clear();
  emitter.removeAllListeners('notify');
}
