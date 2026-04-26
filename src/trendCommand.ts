import { buildTrendReport, formatTrendReport, configureTrendWindow, resetTrend } from './trend';
import { getHistory } from './history';
import { PortEvent } from './snapshot';

export interface TrendCommandOptions {
  windowMinutes?: number;
  port?: number;
  json?: boolean;
}

export function runTrendCommand(options: TrendCommandOptions = {}): string {
  const windowMinutes = options.windowMinutes ?? 60;
  const windowMs = windowMinutes * 60 * 1000;

  configureTrendWindow(windowMs);

  const history = getHistory();
  const events: PortEvent[] = history.map((entry) => ({
    port: entry.port,
    protocol: entry.protocol,
    state: entry.state,
    pid: entry.pid,
    timestamp: entry.timestamp,
    type: entry.type,
  }));

  const filtered = options.port
    ? events.filter((e) => e.port === options.port)
    : events;

  const report = buildTrendReport(filtered);

  if (options.json) {
    return JSON.stringify(report, null, 2);
  }

  return formatTrendReport(report);
}

export function resetTrendCommand(): void {
  resetTrend();
}
