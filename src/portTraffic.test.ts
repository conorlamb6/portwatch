import {
  resetTraffic,
  recordTrafficEntry,
  getTrafficStats,
  getTopPorts,
  configureTrafficWindow,
  PortTrafficStats,
} from './portTraffic';
import { formatTrafficLine, formatTrafficReport, runTrafficCommand } from './portTrafficCommand';

beforeEach(() => {
  resetTraffic();
});

describe('recordTrafficEntry / getTrafficStats', () => {
  it('returns empty array when no entries recorded', () => {
    expect(getTrafficStats()).toEqual([]);
  });

  it('records and returns a single entry', () => {
    recordTrafficEntry(3000, 'tcp', 1000);
    const stats = getTrafficStats(2000);
    expect(stats).toHaveLength(1);
    expect(stats[0].port).toBe(3000);
    expect(stats[0].count).toBe(1);
  });

  it('groups entries by port and protocol', () => {
    recordTrafficEntry(3000, 'tcp', 1000);
    recordTrafficEntry(3000, 'tcp', 2000);
    recordTrafficEntry(8080, 'tcp', 1500);
    const stats = getTrafficStats(5000);
    expect(stats).toHaveLength(2);
    expect(stats[0].port).toBe(3000);
    expect(stats[0].count).toBe(2);
  });

  it('prunes entries outside the window', () => {
    configureTrafficWindow(5000);
    recordTrafficEntry(3000, 'tcp', 1000);
    recordTrafficEntry(3000, 'tcp', 9000);
    const stats = getTrafficStats(12000); // cutoff = 7000, entry at 1000 pruned
    expect(stats[0].count).toBe(1);
  });

  it('sorts by count descending', () => {
    recordTrafficEntry(8080, 'tcp', 1000);
    recordTrafficEntry(3000, 'tcp', 1100);
    recordTrafficEntry(3000, 'tcp', 1200);
    const stats = getTrafficStats(2000);
    expect(stats[0].port).toBe(3000);
  });
});

describe('getTopPorts', () => {
  it('limits results to specified count', () => {
    for (let p = 3000; p < 3010; p++) recordTrafficEntry(p, 'tcp', 1000);
    expect(getTopPorts(3, 2000)).toHaveLength(3);
  });
});

describe('formatTrafficLine', () => {
  it('formats a stat line', () => {
    const stat: PortTrafficStats = { port: 3000, protocol: 'tcp', count: 5, firstSeen: 0, lastSeen: 0, rate: 1.5 };
    const line = formatTrafficLine(stat);
    expect(line).toContain('3000');
    expect(line).toContain('tcp');
    expect(line).toContain('5');
  });
});

describe('formatTrafficReport', () => {
  it('returns no-data message when empty', () => {
    expect(formatTrafficReport([])).toBe('No traffic data available.');
  });

  it('includes header and entries', () => {
    recordTrafficEntry(3000, 'tcp', 1000);
    const stats = getTrafficStats(2000);
    const report = formatTrafficReport(stats);
    expect(report).toContain('Port Traffic Report');
    expect(report).toContain('3000');
  });
});

describe('runTrafficCommand', () => {
  it('returns no-data message when empty', () => {
    expect(runTrafficCommand()).toBe('No traffic data available.');
  });

  it('returns report with entries', () => {
    recordTrafficEntry(3000, 'tcp', 1000);
    const output = runTrafficCommand({ all: true });
    expect(output).toContain('3000');
  });
});
