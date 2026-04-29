import { PortLifecycleEntry } from './portLifecycle';

export interface PortDurationStats {
  port: number;
  protocol: string;
  totalOpenMs: number;
  sessionCount: number;
  avgDurationMs: number;
  longestSessionMs: number;
  shortestSessionMs: number;
}

export function computeDurationStats(
  entries: PortLifecycleEntry[]
): PortDurationStats[] {
  const closed = entries.filter((e) => e.closedAt !== undefined);
  const grouped = new Map<string, PortLifecycleEntry[]>();

  for (const entry of closed) {
    const key = `${entry.port}:${entry.protocol}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  const stats: PortDurationStats[] = [];

  for (const [key, group] of grouped) {
    const [portStr, protocol] = key.split(':');
    const port = parseInt(portStr, 10);
    const durations = group.map((e) => e.closedAt! - e.openedAt);
    const total = durations.reduce((a, b) => a + b, 0);

    stats.push({
      port,
      protocol,
      totalOpenMs: total,
      sessionCount: durations.length,
      avgDurationMs: Math.round(total / durations.length),
      longestSessionMs: Math.max(...durations),
      shortestSessionMs: Math.min(...durations),
    });
  }

  return stats.sort((a, b) => b.totalOpenMs - a.totalOpenMs);
}

export function formatDurationMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3_600_000) return `${(ms / 60_000).toFixed(1)}m`;
  return `${(ms / 3_600_000).toFixed(2)}h`;
}

export function formatDurationReport(stats: PortDurationStats[]): string {
  if (stats.length === 0) return 'No closed port sessions found.';

  const lines = [
    'Port Duration Report',
    '='.repeat(52),
    `${'PORT'.padEnd(8)}${'PROTO'.padEnd(8)}${'SESSIONS'.padEnd(10)}${'TOTAL'.padEnd(10)}${'AVG'.padEnd(10)}LONGEST`,
    '-'.repeat(52),
  ];

  for (const s of stats) {
    lines.push(
      `${String(s.port).padEnd(8)}${s.protocol.padEnd(8)}${String(s.sessionCount).padEnd(10)}${formatDurationMs(s.totalOpenMs).padEnd(10)}${formatDurationMs(s.avgDurationMs).padEnd(10)}${formatDurationMs(s.longestSessionMs)}`
    );
  }

  return lines.join('\n');
}
