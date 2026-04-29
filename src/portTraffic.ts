/**
 * portTraffic.ts
 * Tracks connection frequency per port over a rolling time window.
 */

export interface TrafficEntry {
  port: number;
  protocol: string;
  timestamp: number;
}

export interface PortTrafficStats {
  port: number;
  protocol: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  rate: number; // connections per minute
}

let trafficLog: TrafficEntry[] = [];
let windowMs = 60_000;

export function configureTrafficWindow(ms: number): void {
  windowMs = ms;
}

export function resetTraffic(): void {
  trafficLog = [];
  windowMs = 60_000;
}

export function recordTrafficEntry(port: number, protocol: string, timestamp = Date.now()): void {
  trafficLog.push({ port, protocol, timestamp });
}

function pruneOld(now: number): void {
  const cutoff = now - windowMs;
  trafficLog = trafficLog.filter((e) => e.timestamp >= cutoff);
}

export function getTrafficStats(now = Date.now()): PortTrafficStats[] {
  pruneOld(now);
  const map = new Map<string, TrafficEntry[]>();
  for (const entry of trafficLog) {
    const key = `${entry.port}:${entry.protocol}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
  }
  const stats: PortTrafficStats[] = [];
  for (const [, entries] of map) {
    const timestamps = entries.map((e) => e.timestamp);
    const first = Math.min(...timestamps);
    const last = Math.max(...timestamps);
    const spanMinutes = Math.max((last - first) / 60_000, 1 / 60);
    stats.push({
      port: entries[0].port,
      protocol: entries[0].protocol,
      count: entries.length,
      firstSeen: first,
      lastSeen: last,
      rate: parseFloat((entries.length / spanMinutes).toFixed(2)),
    });
  }
  return stats.sort((a, b) => b.count - a.count);
}

export function getTopPorts(limit = 5, now = Date.now()): PortTrafficStats[] {
  return getTrafficStats(now).slice(0, limit);
}
