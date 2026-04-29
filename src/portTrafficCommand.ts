/**
 * portTrafficCommand.ts
 * CLI command handler for displaying port traffic statistics.
 */

import { getTopPorts, getTrafficStats, PortTrafficStats } from './portTraffic';

export function formatTrafficLine(stat: PortTrafficStats): string {
  const time = new Date(stat.lastSeen).toISOString();
  return `  ${String(stat.port).padEnd(6)} ${stat.protocol.padEnd(5)} ${String(stat.count).padStart(5)} hits   ${String(stat.rate).padStart(7)} conn/min   last: ${time}`;
}

export function formatTrafficReport(stats: PortTrafficStats[]): string {
  if (stats.length === 0) return 'No traffic data available.';
  const header = `  ${'PORT'.padEnd(6)} ${'PROTO'.padEnd(5)} ${'HITS'.padStart(5)}          ${'RATE'.padStart(7)}            LAST SEEN`;
  const divider = '  ' + '-'.repeat(72);
  const lines = stats.map(formatTrafficLine);
  return ['Port Traffic Report', divider, header, divider, ...lines, divider].join('\n');
}

export interface TrafficCommandOptions {
  top?: number;
  all?: boolean;
}

export function runTrafficCommand(options: TrafficCommandOptions = {}): string {
  const { top = 10, all = false } = options;
  const stats = all ? getTrafficStats() : getTopPorts(top);
  return formatTrafficReport(stats);
}
