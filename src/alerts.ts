import { PortEvent } from './monitor';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertRule {
  ports?: number[];
  severity: AlertSeverity;
  message?: string;
}

export interface Alert {
  timestamp: Date;
  severity: AlertSeverity;
  event: PortEvent;
  message: string;
}

export interface AlertConfig {
  rules: AlertRule[];
  onAlert?: (alert: Alert) => void;
}

let alertConfig: AlertConfig = { rules: [] };

export function configureAlerts(config: AlertConfig): void {
  alertConfig = config;
}

export function evaluateEvent(event: PortEvent): Alert | null {
  for (const rule of alertConfig.rules) {
    const portMatches =
      !rule.ports || rule.ports.length === 0 || rule.ports.includes(event.port);

    if (portMatches) {
      const alert: Alert = {
        timestamp: new Date(),
        severity: rule.severity,
        event,
        message:
          rule.message ??
          `Port ${event.port} ${event.type === 'opened' ? 'opened' : 'closed'} (${event.process ?? 'unknown'})`,
      };

      if (alertConfig.onAlert) {
        alertConfig.onAlert(alert);
      }

      return alert;
    }
  }

  return null;
}

export function evaluateEvents(events: PortEvent[]): Alert[] {
  return events.reduce<Alert[]>((acc, event) => {
    const alert = evaluateEvent(event);
    if (alert) acc.push(alert);
    return acc;
  }, []);
}

export function resetAlerts(): void {
  alertConfig = { rules: [] };
}
