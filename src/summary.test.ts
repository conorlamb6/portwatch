import {
  resetSummary,
  buildPortSummaries,
  buildSessionSummary,
  formatSessionSummary,
} from './summary';
import { HistoryEntry } from './history';

const makeEntry = (
  port: number,
  event: 'open' | 'close',
  timestamp: number
): HistoryEntry => ({ port, event, timestamp, pid: undefined, process: undefined });

describe('buildPortSummaries', () => {
  it('returns empty array for no entries', () => {
    expect(buildPortSummaries([])).toEqual([]);
  });

  it('counts open and close events per port', () => {
    const entries: HistoryEntry[] = [
      makeEntry(3000, 'open', 1000),
      makeEntry(3000, 'close', 2000),
      makeEntry(3000, 'open', 3000),
      makeEntry(8080, 'open', 1500),
    ];
    const summaries = buildPortSummaries(entries);
    const p3000 = summaries.find((s) => s.port === 3000)!;
    expect(p3000.openCount).toBe(2);
    expect(p3000.closeCount).toBe(1);
    expect(p3000.firstSeen).toBe(1000);
    expect(p3000.lastSeen).toBe(3000);
  });

  it('sorts by total event count descending', () => {
    const entries: HistoryEntry[] = [
      makeEntry(8080, 'open', 100),
      makeEntry(3000, 'open', 200),
      makeEntry(3000, 'close', 300),
      makeEntry(3000, 'open', 400),
    ];
    const summaries = buildPortSummaries(entries);
    expect(summaries[0].port).toBe(3000);
  });
});

describe('buildSessionSummary', () => {
  beforeEach(() => resetSummary());

  it('returns correct totals', () => {
    const entries: HistoryEntry[] = [
      makeEntry(3000, 'open', 1000),
      makeEntry(4000, 'open', 2000),
      makeEntry(3000, 'close', 3000),
    ];
    const summary = buildSessionSummary(entries);
    expect(summary.totalEvents).toBe(3);
    expect(summary.uniquePorts).toBe(2);
    expect(summary.durationMs).toBe(2000);
  });

  it('caches result on second call', () => {
    const entries: HistoryEntry[] = [makeEntry(3000, 'open', 1000)];
    const first = buildSessionSummary(entries);
    const second = buildSessionSummary([]);
    expect(second).toBe(first);
  });

  it('limits topPorts to 5', () => {
    const entries: HistoryEntry[] = [1, 2, 3, 4, 5, 6].map((p) =>
      makeEntry(p * 1000, 'open', p * 100)
    );
    const summary = buildSessionSummary(entries);
    expect(summary.topPorts.length).toBeLessThanOrEqual(5);
  });
});

describe('formatSessionSummary', () => {
  beforeEach(() => resetSummary());

  it('includes header and port lines', () => {
    const entries: HistoryEntry[] = [
      makeEntry(3000, 'open', 1000),
      makeEntry(3000, 'close', 5000),
    ];
    const summary = buildSessionSummary(entries);
    const output = formatSessionSummary(summary);
    expect(output).toContain('Session Summary');
    expect(output).toContain(':3000');
    expect(output).toContain('open=1');
  });
});
