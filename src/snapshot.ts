import { PortEntry } from './scanner';

export interface Snapshot {
  timestamp: number;
  ports: PortEntry[];
}

export interface SnapshotDiff {
  opened: PortEntry[];
  closed: PortEntry[];
  timestamp: number;
}

let snapshots: Snapshot[] = [];

export function resetSnapshots(): void {
  snapshots = [];
}

export function createSnapshot(ports: PortEntry[]): Snapshot {
  const snapshot: Snapshot = {
    timestamp: Date.now(),
    ports: [...ports],
  };
  snapshots.push(snapshot);
  return snapshot;
}

export function getSnapshots(): Snapshot[] {
  return [...snapshots];
}

export function getLatestSnapshot(): Snapshot | null {
  return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
}

export function diffSnapshots(prev: Snapshot, next: Snapshot): SnapshotDiff {
  const prevKeys = new Set(prev.ports.map((p) => `${p.protocol}:${p.port}`));
  const nextKeys = new Set(next.ports.map((p) => `${p.protocol}:${p.port}`));

  const opened = next.ports.filter((p) => !prevKeys.has(`${p.protocol}:${p.port}`));
  const closed = prev.ports.filter((p) => !nextKeys.has(`${p.protocol}:${p.port}`));

  return {
    opened,
    closed,
    timestamp: next.timestamp,
  };
}

export function pruneSnapshots(maxAge: number): void {
  const cutoff = Date.now() - maxAge;
  snapshots = snapshots.filter((s) => s.timestamp >= cutoff);
}

export function snapshotCount(): number {
  return snapshots.length;
}
