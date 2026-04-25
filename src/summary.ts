import { HistoryEntry } from './history';

export interface PortSummary {
  port: number;
  openCount: number;
  closeCount: number;
  lastSeen: number;
  firstSeen: number;
}

export interface SessionSummary {
  totalEvents: number;
  uniquePorts: number;
  topPorts: PortSummary[];
  startTime: number;
  endTime: number;
  durationMs: number;
}

let _summaryCache: SessionSummary | null = null;

export function resetSummary(): void {
  _summaryCache = null;
}

export function buildPortSummaries(entries: HistoryEntry[]): PortSummary[] {
  const map = new Map<number, PortSummary>();

  for (const entry of entries) {
    if (!map.has(entry.port)) {
      map.set(entry.port, {
        port: entry.port,
        openCount: 0,
        closeCount: 0,
        lastSeen: entry.timestamp,
        firstSeen: entry.timestamp,
      });
    }
    const summary = map.get(entry.port)!;
    if (entry.event === 'open') summary.openCount++;
    if (entry.event === 'close') summary.closeCount++;
    if (entry.timestamp > summary.lastSeen) summary.lastSeen = entry.timestamp;
    if (entry.timestamp < summary.firstSeen) summary.firstSeen = entry.timestamp;
  }

  return Array.from(map.values()).sort(
    (a, b) => b.openCount + b.closeCount - (a.openCount + a.closeCount)
  );
}

export function buildSessionSummary(entries: HistoryEntry[]): SessionSummary {
  if (_summaryCache) return _summaryCache;

  const portSummaries = buildPortSummaries(entries);
  const timestamps = entries.map((e) => e.timestamp);
  const startTime = timestamps.length ? Math.min(...timestamps) : Date.now();
  const endTime = timestamps.length ? Math.max(...timestamps) : Date.now();

  _summaryCache = {
    totalEvents: entries.length,
    uniquePorts: portSummaries.length,
    topPorts: portSummaries.slice(0, 5),
    startTime,
    endTime,
    durationMs: endTime - startTime,
  };

  return _summaryCache;
}

export function formatSessionSummary(summary: SessionSummary): string {
  const lines: string[] = [
    '=== Session Summary ===',
    `Duration : ${(summary.durationMs / 1000).toFixed(1)}s`,
    `Events   : ${summary.totalEvents}`,
    `Ports    : ${summary.uniquePorts} unique`,
    '',
    'Top Ports:',
  ];

  for (const p of summary.topPorts) {
    lines.push(`  :${p.port}  open=${p.openCount}  close=${p.closeCount}`);
  }

  return lines.join('\n');
}
