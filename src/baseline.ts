/**
 * baseline.ts
 * Captures and persists a "known good" snapshot of open ports
 * so that subsequent scans can be compared against it.
 */

import * as fs from 'fs';
import { PortEntry } from './scanner';

export interface Baseline {
  capturedAt: string;
  ports: PortEntry[];
}

let currentBaseline: Baseline | null = null;

export function resetBaseline(): void {
  currentBaseline = null;
}

export function captureBaseline(ports: PortEntry[]): Baseline {
  currentBaseline = {
    capturedAt: new Date().toISOString(),
    ports: [...ports],
  };
  return currentBaseline;
}

export function getBaseline(): Baseline | null {
  return currentBaseline;
}

export function saveBaselineToFile(baseline: Baseline, filePath: string): void {
  fs.writeFileSync(filePath, JSON.stringify(baseline, null, 2), 'utf-8');
}

export function loadBaselineFromFile(filePath: string): Baseline {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Baseline file not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as Baseline;
  currentBaseline = parsed;
  return parsed;
}

export function diffAgainstBaseline(
  baseline: Baseline,
  current: PortEntry[]
): { added: PortEntry[]; removed: PortEntry[] } {
  const baselineKeys = new Set(
    baseline.ports.map((p) => `${p.protocol}:${p.port}`)
  );
  const currentKeys = new Set(current.map((p) => `${p.protocol}:${p.port}`));

  const added = current.filter((p) => !baselineKeys.has(`${p.protocol}:${p.port}`));
  const removed = baseline.ports.filter(
    (p) => !currentKeys.has(`${p.protocol}:${p.port}`)
  );

  return { added, removed };
}
