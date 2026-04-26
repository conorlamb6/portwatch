import { getHistory, HistoryEntry } from './history';

export interface PortTrend {
  port: number;
  protocol: string;
  openCount: number;
  closeCount: number;
  firstSeen: number;
  lastSeen: number;
  avgDurationMs: number | null;
}

export interface TrendReport {
  windowMs: number;
  generatedAt: number;
  trends: PortTrend[];
}

let trendWindowMs = 60 * 60 * 1000; // default: 1 hour

export function configureTrendWindow(ms: number): void {
  trendWindowMs = ms;
}

export function resetTrend(): void {
  trendWindowMs = 60 * 60 * 1000;
}

export function buildTrendReport(windowMs?: number): TrendReport {
  const win = windowMs ?? trendWindowMs;
  const now = Date.now();
  const cutoff = now - win;
  const entries: HistoryEntry[] = getHistory().filter(e => e.timestamp >= cutoff);

  const map = new Map<string, PortTrend>();

  for (const entry of entries) {
    const key = `${entry.port}:${entry.protocol}`;
    if (!map.has(key)) {
      map.set(key, {
        port: entry.port,
        protocol: entry.protocol,
        openCount: 0,
        closeCount: 0,
        firstSeen: entry.timestamp,
        lastSeen: entry.timestamp,
        avgDurationMs: null,
      });
    }
    const trend = map.get(key)!;
    if (entry.event === 'open') trend.openCount++;
    if (entry.event === 'close') trend.closeCount++;
    if (entry.timestamp < trend.firstSeen) trend.firstSeen = entry.timestamp;
    if (entry.timestamp > trend.lastSeen) trend.lastSeen = entry.timestamp;
  }

  const trends = Array.from(map.values()).map(t => ({
    ...t,
    avgDurationMs: t.openCount > 0 ? (t.lastSeen - t.firstSeen) / t.openCount : null,
  }));

  trends.sort((a, b) => b.openCount - a.openCount);

  return { windowMs: win, generatedAt: now, trends };
}

export function formatTrendReport(report: TrendReport): string {
  const lines: string[] = [
    `Trend Report (window: ${report.windowMs / 1000}s) — ${new Date(report.generatedAt).toISOString()}`,
    `${'Port'.padEnd(8)}${'Proto'.padEnd(8)}${'Opens'.padEnd(8)}${'Closes'.padEnd(8)}Avg Duration`,
    '-'.repeat(52),
  ];
  for (const t of report.trends) {
    const dur = t.avgDurationMs !== null ? `${t.avgDurationMs.toFixed(0)}ms` : 'n/a';
    lines.push(
      `${String(t.port).padEnd(8)}${t.protocol.padEnd(8)}${String(t.openCount).padEnd(8)}${String(t.closeCount).padEnd(8)}${dur}`
    );
  }
  return lines.join('\n');
}
