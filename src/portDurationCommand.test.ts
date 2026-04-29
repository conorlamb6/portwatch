import {
  filterDurationStats,
  runDurationCommand,
  resetDurationCommand,
  getDurationOutput,
} from './portDurationCommand';
import { PortDurationStats } from './portDuration';
import { resetLifecycle, recordPortOpen, recordPortClose } from './portLifecycle';

const now = 1_700_000_000_000;

function makeStat(
  port: number,
  protocol: string,
  sessionCount: number,
  totalOpenMs: number
): PortDurationStats {
  return {
    port,
    protocol,
    totalOpenMs,
    sessionCount,
    avgDurationMs: Math.round(totalOpenMs / sessionCount),
    longestSessionMs: totalOpenMs,
    shortestSessionMs: Math.round(totalOpenMs / sessionCount),
  };
}

beforeEach(() => {
  resetLifecycle();
  resetDurationCommand();
});

describe('filterDurationStats', () => {
  const stats = [
    makeStat(80, 'tcp', 5, 10000),
    makeStat(53, 'udp', 2, 3000),
    makeStat(443, 'tcp', 1, 500),
    makeStat(8080, 'tcp', 8, 20000),
  ];

  it('returns all stats with empty options', () => {
    expect(filterDurationStats(stats, {})).toHaveLength(4);
  });

  it('filters by protocol', () => {
    const result = filterDurationStats(stats, { protocol: 'udp' });
    expect(result).toHaveLength(1);
    expect(result[0].port).toBe(53);
  });

  it('filters by minSessions', () => {
    const result = filterDurationStats(stats, { minSessions: 5 });
    expect(result.every((s) => s.sessionCount >= 5)).toBe(true);
  });

  it('limits results with top', () => {
    const result = filterDurationStats(stats, { top: 2 });
    expect(result).toHaveLength(2);
  });

  it('combines filters', () => {
    const result = filterDurationStats(stats, { protocol: 'tcp', minSessions: 4, top: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].protocol).toBe('tcp');
    expect(result[0].sessionCount).toBeGreaterThanOrEqual(4);
  });
});

describe('runDurationCommand', () => {
  it('returns no-sessions message when no closed ports', () => {
    recordPortOpen(3000, 'tcp', now);
    const output = runDurationCommand();
    expect(output).toMatch(/No closed/);
  });

  it('returns formatted report for closed ports', () => {
    recordPortOpen(9000, 'tcp', now);
    recordPortClose(9000, 'tcp', now + 8000);
    const output = runDurationCommand();
    expect(output).toMatch('9000');
    expect(output).toMatch('tcp');
  });

  it('stores output accessible via getDurationOutput', () => {
    runDurationCommand();
    expect(getDurationOutput()).toBeTruthy();
  });

  it('respects top option', () => {
    recordPortOpen(1111, 'tcp', now);
    recordPortClose(1111, 'tcp', now + 1000);
    recordPortOpen(2222, 'tcp', now);
    recordPortClose(2222, 'tcp', now + 2000);
    const output = runDurationCommand({ top: 1 });
    expect(output).toMatch('2222');
    expect(output).not.toMatch('1111');
  });
});
