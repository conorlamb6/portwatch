import {
  computeDurationStats,
  formatDurationMs,
  formatDurationReport,
} from './portDuration';
import { PortLifecycleEntry } from './portLifecycle';

const now = 1_700_000_000_000;

function makeEntry(
  port: number,
  protocol: string,
  openedAt: number,
  closedAt?: number
): PortLifecycleEntry {
  return { port, protocol, openedAt, closedAt };
}

describe('computeDurationStats', () => {
  it('returns empty array when no closed entries', () => {
    const entries = [makeEntry(3000, 'tcp', now)];
    expect(computeDurationStats(entries)).toEqual([]);
  });

  it('computes stats for a single closed session', () => {
    const entries = [makeEntry(3000, 'tcp', now, now + 5000)];
    const stats = computeDurationStats(entries);
    expect(stats).toHaveLength(1);
    expect(stats[0].port).toBe(3000);
    expect(stats[0].totalOpenMs).toBe(5000);
    expect(stats[0].sessionCount).toBe(1);
    expect(stats[0].avgDurationMs).toBe(5000);
    expect(stats[0].longestSessionMs).toBe(5000);
    expect(stats[0].shortestSessionMs).toBe(5000);
  });

  it('aggregates multiple sessions for the same port', () => {
    const entries = [
      makeEntry(8080, 'tcp', now, now + 2000),
      makeEntry(8080, 'tcp', now + 10000, now + 14000),
    ];
    const stats = computeDurationStats(entries);
    expect(stats[0].sessionCount).toBe(2);
    expect(stats[0].totalOpenMs).toBe(6000);
    expect(stats[0].avgDurationMs).toBe(3000);
    expect(stats[0].longestSessionMs).toBe(4000);
    expect(stats[0].shortestSessionMs).toBe(2000);
  });

  it('sorts by totalOpenMs descending', () => {
    const entries = [
      makeEntry(80, 'tcp', now, now + 1000),
      makeEntry(443, 'tcp', now, now + 9000),
    ];
    const stats = computeDurationStats(entries);
    expect(stats[0].port).toBe(443);
    expect(stats[1].port).toBe(80);
  });

  it('treats same port on different protocols as separate', () => {
    const entries = [
      makeEntry(53, 'tcp', now, now + 500),
      makeEntry(53, 'udp', now, now + 1500),
    ];
    const stats = computeDurationStats(entries);
    expect(stats).toHaveLength(2);
  });
});

describe('formatDurationMs', () => {
  it('formats milliseconds', () => expect(formatDurationMs(200)).toBe('200ms'));
  it('formats seconds', () => expect(formatDurationMs(2500)).toBe('2.5s'));
  it('formats minutes', () => expect(formatDurationMs(90_000)).toBe('1.5m'));
  it('formats hours', () => expect(formatDurationMs(7_200_000)).toBe('2.00h'));
});

describe('formatDurationReport', () => {
  it('returns message when no stats', () => {
    expect(formatDurationReport([])).toMatch(/No closed/);
  });

  it('includes port and session info', () => {
    const entries = [makeEntry(3000, 'tcp', now, now + 3000)];
    const stats = computeDurationStats(entries);
    const report = formatDurationReport(stats);
    expect(report).toMatch('3000');
    expect(report).toMatch('tcp');
    expect(report).toMatch('3.0s');
  });
});
