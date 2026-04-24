import { AlertEvent } from './alerts';
import { logAlert } from './logger';
import { recordEntry } from './reporter';
import { sendNotification, NotificationPayload } from './notifier';

export interface DispatchOptions {
  notify: boolean;
  log: boolean;
  record: boolean;
}

const DEFAULT_OPTIONS: DispatchOptions = {
  notify: true,
  log: true,
  record: true,
};

let options: DispatchOptions = { ...DEFAULT_OPTIONS };

export function configureDispatch(opts: Partial<DispatchOptions>): void {
  options = { ...DEFAULT_OPTIONS, ...opts };
}

function alertLevelToNotificationLevel(
  severity: AlertEvent['severity']
): NotificationPayload['level'] {
  if (severity === 'critical') return 'critical';
  if (severity === 'warning') return 'warn';
  return 'info';
}

export function dispatchEvent(event: AlertEvent): void {
  if (options.log) {
    logAlert(event);
  }

  if (options.record) {
    recordEntry({
      port: event.port,
      state: event.type === 'opened' ? 'open' : 'closed',
      pid: event.pid,
      timestamp: event.timestamp,
    });
  }

  if (options.notify) {
    sendNotification({
      level: alertLevelToNotificationLevel(event.severity),
      message: `port ${event.type}: ${event.port}`,
      port: event.port,
      timestamp: event.timestamp,
      meta: { pid: event.pid, process: event.processName },
    });
  }
}

export function dispatchEvents(events: AlertEvent[]): void {
  for (const event of events) {
    dispatchEvent(event);
  }
}

export function resetDispatch(): void {
  options = { ...DEFAULT_OPTIONS };
}
