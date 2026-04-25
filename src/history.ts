import * as fs from 'fs';
import * as path from 'path';

export interface HistoryEntry {
  timestamp: string;
  port: number;
  protocol: string;
  state: string;
  pid?: number;
  process?: string;
  event: 'opened' | 'closed';
}

export interface PortHistory {
  entries: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

let historyStore: PortHistory = {
  entries: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function resetHistory(): void {
  historyStore = {
    entries: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function recordHistoryEntry(entry: HistoryEntry): void {
  historyStore.entries.push(entry);
  historyStore.updatedAt = new Date().toISOString();
}

export function getHistory(): PortHistory {
  return { ...historyStore, entries: [...historyStore.entries] };
}

export function filterHistory(
  entries: HistoryEntry[],
  port?: number,
  event?: 'opened' | 'closed',
  since?: Date
): HistoryEntry[] {
  return entries.filter((e) => {
    if (port !== undefined && e.port !== port) return false;
    if (event !== undefined && e.event !== event) return false;
    if (since !== undefined && new Date(e.timestamp) < since) return false;
    return true;
  });
}

export function loadHistoryFromFile(filePath: string): PortHistory {
  const resolved = path.resolve(filePath);
  const raw = fs.readFileSync(resolved, 'utf-8');
  const parsed: PortHistory = JSON.parse(raw);
  historyStore = parsed;
  return parsed;
}

export function saveHistoryToFile(filePath: string): void {
  const resolved = path.resolve(filePath);
  fs.writeFileSync(resolved, JSON.stringify(historyStore, null, 2), 'utf-8');
}
