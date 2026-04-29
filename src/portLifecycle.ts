/**
 * portLifecycle.ts
 * Tracks the lifecycle (open/close durations) of ports observed during a session.
 */

export interface PortLifecycleEntry {
  port: number;
  protocol: string;
  openedAt: number;
  closedAt?: number;
  durationMs?: number;
}

const lifecycleMap = new Map<string, PortLifecycleEntry>();
const closedEntries: PortLifecycleEntry[] = [];

export function resetLifecycle(): void {
  lifecycleMap.clear();
  closedEntries.length = 0;
}

function makeKey(port: number, protocol: string): string {
  return `${port}/${protocol}`;
}

export function recordPortOpen(port: number, protocol: string, timestamp: number = Date.now()): void {
  const key = makeKey(port, protocol);
  if (!lifecycleMap.has(key)) {
    lifecycleMap.set(key, { port, protocol, openedAt: timestamp });
  }
}

export function recordPortClose(port: number, protocol: string, timestamp: number = Date.now()): PortLifecycleEntry | undefined {
  const key = makeKey(port, protocol);
  const entry = lifecycleMap.get(key);
  if (!entry) return undefined;
  const closed: PortLifecycleEntry = {
    ...entry,
    closedAt: timestamp,
    durationMs: timestamp - entry.openedAt,
  };
  closedEntries.push(closed);
  lifecycleMap.delete(key);
  return closed;
}

export function getOpenPorts(): PortLifecycleEntry[] {
  return Array.from(lifecycleMap.values());
}

export function getClosedPorts(): PortLifecycleEntry[] {
  return [...closedEntries];
}

export function getAllLifecycleEntries(): PortLifecycleEntry[] {
  return [...getOpenPorts(), ...getClosedPorts()];
}

export function formatLifecycleEntry(entry: PortLifecycleEntry): string {
  const status = entry.closedAt !== undefined ? 'CLOSED' : 'OPEN';
  const duration = entry.durationMs !== undefined ? ` (${entry.durationMs}ms)` : '';
  return `[${status}] ${entry.port}/${entry.protocol} opened=${new Date(entry.openedAt).toISOString()}${duration}`;
}
