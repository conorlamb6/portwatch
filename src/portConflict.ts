/**
 * portConflict.ts
 * Detects and reports ports that are bound by multiple processes or
 * that conflict with well-known service expectations.
 */

import { PortEntry } from './scanner';

export interface ConflictEntry {
  port: number;
  protocol: string;
  pids: number[];
  processes: string[];
  reason: 'multi-process' | 'unexpected-process' | 'duplicate-bind';
}

let expectedProcessMap: Map<number, string> = new Map();

export function resetConflicts(): void {
  expectedProcessMap = new Map();
}

export function configureExpectedProcesses(map: Record<number, string>): void {
  expectedProcessMap = new Map(Object.entries(map).map(([k, v]) => [Number(k), v]));
}

export function detectMultiProcessConflicts(entries: PortEntry[]): ConflictEntry[] {
  const grouped = new Map<string, PortEntry[]>();

  for (const entry of entries) {
    const key = `${entry.port}:${entry.protocol}`;
    const group = grouped.get(key) ?? [];
    group.push(entry);
    grouped.set(key, group);
  }

  const conflicts: ConflictEntry[] = [];

  for (const [key, group] of grouped.entries()) {
    if (group.length < 2) continue;
    const [portStr, protocol] = key.split(':');
    const pids = group.map(e => e.pid).filter((p): p is number => p !== undefined);
    const processes = group.map(e => e.process ?? 'unknown');
    conflicts.push({
      port: Number(portStr),
      protocol,
      pids,
      processes,
      reason: 'multi-process',
    });
  }

  return conflicts;
}

export function detectUnexpectedProcessConflicts(entries: PortEntry[]): ConflictEntry[] {
  const conflicts: ConflictEntry[] = [];

  for (const entry of entries) {
    const expected = expectedProcessMap.get(entry.port);
    if (!expected) continue;
    const actual = entry.process ?? '';
    if (!actual.includes(expected)) {
      conflicts.push({
        port: entry.port,
        protocol: entry.protocol,
        pids: entry.pid !== undefined ? [entry.pid] : [],
        processes: [actual],
        reason: 'unexpected-process',
      });
    }
  }

  return conflicts;
}

export function analyzeConflicts(entries: PortEntry[]): ConflictEntry[] {
  return [
    ...detectMultiProcessConflicts(entries),
    ...detectUnexpectedProcessConflicts(entries),
  ];
}

export function formatConflictReport(conflicts: ConflictEntry[]): string {
  if (conflicts.length === 0) return 'No port conflicts detected.';
  const lines = ['Port Conflicts:', ''];
  for (const c of conflicts) {
    lines.push(`  [${c.reason}] ${c.protocol.toUpperCase()}:${c.port}`);
    lines.push(`    Processes : ${c.processes.join(', ')}`);
    if (c.pids.length > 0) lines.push(`    PIDs      : ${c.pids.join(', ')}`);
  }
  return lines.join('\n');
}
