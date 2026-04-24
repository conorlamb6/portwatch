import { loadConfig } from './config';
import { filterByPorts, PortInfo, scanPorts } from './scanner';

export interface MonitorSnapshot {
  timestamp: Date;
  ports: PortInfo[];
}

export interface PortChange {
  type: 'opened' | 'closed';
  port: PortInfo;
  timestamp: Date;
}

let previousSnapshot: MonitorSnapshot | null = null;

export function takeSnapshot(): MonitorSnapshot {
  const config = loadConfig();
  const allPorts = scanPorts();
  const watchList: number[] = config.ports ?? [];
  const ports = filterByPorts(allPorts, watchList);

  return { timestamp: new Date(), ports };
}

export function diffSnapshots(
  prev: MonitorSnapshot,
  current: MonitorSnapshot
): PortChange[] {
  const changes: PortChange[] = [];
  const prevPorts = new Map(prev.ports.map((p) => [`${p.protocol}:${p.port}`, p]));
  const currPorts = new Map(current.ports.map((p) => [`${p.protocol}:${p.port}`, p]));

  for (const [key, port] of currPorts) {
    if (!prevPorts.has(key)) {
      changes.push({ type: 'opened', port, timestamp: current.timestamp });
    }
  }

  for (const [key, port] of prevPorts) {
    if (!currPorts.has(key)) {
      changes.push({ type: 'closed', port, timestamp: current.timestamp });
    }
  }

  return changes;
}

export function poll(intervalMs: number, onChange: (changes: PortChange[]) => void): NodeJS.Timer {
  return setInterval(() => {
    const current = takeSnapshot();

    if (previousSnapshot) {
      const changes = diffSnapshots(previousSnapshot, current);
      if (changes.length > 0) onChange(changes);
    }

    previousSnapshot = current;
  }, intervalMs);
}

export function resetMonitor(): void {
  previousSnapshot = null;
}
