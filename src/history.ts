export interface HistoryEntry {
  port: number;
  event: 'open' | 'close';
  timestamp: number;
  pid?: number;
  process?: string;
}

let _history: HistoryEntry[] = [];

export function resetHistory(): void {
  _history = [];
}

export function recordHistoryEntry(entry: HistoryEntry): void {
  _history.push(entry);
}

export function getHistory(): HistoryEntry[] {
  return [..._history];
}

export function filterHistory(
  predicate: (entry: HistoryEntry) => boolean
): HistoryEntry[] {
  return _history.filter(predicate);
}

export function loadHistoryFromFile(raw: string): void {
  try {
    const parsed: HistoryEntry[] = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      _history = parsed;
    }
  } catch {
    // ignore malformed input
  }
}

export function serializeHistory(): string {
  return JSON.stringify(_history, null, 2);
}
