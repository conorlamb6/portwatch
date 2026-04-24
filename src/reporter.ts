import { PortEvent } from './monitor';
import { AlertResult } from './alerts';
import { formatAlert } from './logger';

export interface ReportEntry {
  timestamp: string;
  event: PortEvent;
  alerts: AlertResult[];
}

export interface Report {
  generatedAt: string;
  durationMs: number;
  entries: ReportEntry[];
  summary: ReportSummary;
}

export interface ReportSummary {
  totalEvents: number;
  openedPorts: number[];
  closedPorts: number[];
  alertsFired: number;
}

const reportEntries: ReportEntry[] = [];
let reportStartTime = Date.now();

export function resetReporter(): void {
  reportEntries.length = 0;
  reportStartTime = Date.now();
}

export function recordEntry(event: PortEvent, alerts: AlertResult[]): void {
  reportEntries.push({
    timestamp: new Date().toISOString(),
    event,
    alerts,
  });
}

export function buildReport(): Report {
  const openedPorts = reportEntries
    .filter((e) => e.event.type === 'opened')
    .map((e) => e.event.port);

  const closedPorts = reportEntries
    .filter((e) => e.event.type === 'closed')
    .map((e) => e.event.port);

  const alertsFired = reportEntries.reduce(
    (acc, e) => acc + e.alerts.filter((a) => a.triggered).length,
    0
  );

  return {
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - reportStartTime,
    entries: [...reportEntries],
    summary: {
      totalEvents: reportEntries.length,
      openedPorts,
      closedPorts,
      alertsFired,
    },
  };
}

export function formatReport(report: Report): string {
  const lines: string[] = [
    `=== PortWatch Report ===`,
    `Generated: ${report.generatedAt}`,
    `Duration:  ${report.durationMs}ms`,
    ``,
    `--- Summary ---`,
    `Total events : ${report.summary.totalEvents}`,
    `Ports opened : ${report.summary.openedPorts.join(', ') || 'none'}`,
    `Ports closed : ${report.summary.closedPorts.join(', ') || 'none'}`,
    `Alerts fired : ${report.summary.alertsFired}`,
    ``,
    `--- Events ---`,
  ];

  for (const entry of report.entries) {
    lines.push(`[${entry.timestamp}] ${entry.event.type.toUpperCase()} port ${entry.event.port}`);
    for (const alert of entry.alerts.filter((a) => a.triggered)) {
      lines.push(`  ⚠ ${formatAlert(alert)}`);
    }
  }

  return lines.join('\n');
}
