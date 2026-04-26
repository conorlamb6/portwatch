import {
  buildTrendReport,
  configureTrendWindow,
  formatTrendReport,
  resetTrend,
} from './trend';
import { resetHistory, recordHistoryEntry } from './history';

beforeEach(() => {
  resetHistory();
  resetTrend();
});

describe('buildTrendReport', () => {
  it('returns empty trends when no history', () => {
    const report = buildTrendReport(60_000);
    expect(report.trends).toHaveLength(0);
    expect(report.windowMs).toBe(60_000);
  });

  it('counts open and close events per port', () => {
    const now = Date.now();
    recordHistoryEntry({ port: 3000, protocol: 'tcp', event: 'open', timestamp: now - 1000 });
    recordHistoryEntry({ port: 3000, protocol: 'tcp', event: 'open', timestamp: now - 500 });
    recordHistoryEntry({ port: 3000, protocol: 'tcp', event: 'close', timestamp: now - 100 });
    const report = buildTrendReport(60_000);
    expect(report.trends).toHaveLength(1);
    expect(report.trends[0].openCount).toBe(2);
    expect(report.trends[0].closeCount).toBe(1);
  });

  it('excludes entries older than the window', () => {
    const now = Date.now();
    recordHistoryEntry({ port: 8080, protocol: 'tcp', event: 'open', timestamp: now - 120_000 });
    recordHistoryEntry({ port: 8080, protocol: 'tcp', event: 'open', timestamp: now - 1000 });
    const report = buildTrendReport(60_000);
    expect(report.trends[0].openCount).toBe(1);
  });

  it('tracks firstSeen and lastSeen correctly', () => {
    const now = Date.now();
    recordHistoryEntry({ port: 5000, protocol: 'udp', event: 'open', timestamp: now - 3000 });
    recordHistoryEntry({ port: 5000, protocol: 'udp', event: 'open', timestamp: now - 1000 });
    const report = buildTrendReport(60_000);
    const t = report.trends[0];
    expect(t.firstSeen).toBeLessThan(t.lastSeen);
  });

  it('separates trends by protocol', () => {
    const now = Date.now();
    recordHistoryEntry({ port: 53, protocol: 'tcp', event: 'open', timestamp: now - 100 });
    recordHistoryEntry({ port: 53, protocol: 'udp', event: 'open', timestamp: now - 200 });
    const report = buildTrendReport(60_000);
    expect(report.trends).toHaveLength(2);
  });

  it('uses configured window when no argument provided', () => {
    configureTrendWindow(30_000);
    const now = Date.now();
    recordHistoryEntry({ port: 9090, protocol: 'tcp', event: 'open', timestamp: now - 40_000 });
    const report = buildTrendReport();
    expect(report.trends).toHaveLength(0);
    expect(report.windowMs).toBe(30_000);
  });
});

describe('formatTrendReport', () => {
  it('includes header and separator', () => {
    const report = buildTrendReport(60_000);
    const output = formatTrendReport(report);
    expect(output).toContain('Trend Report');
    expect(output).toContain('Port');
    expect(output).toContain('Proto');
  });

  it('includes port data rows', () => {
    const now = Date.now();
    recordHistoryEntry({ port: 3000, protocol: 'tcp', event: 'open', timestamp: now - 500 });
    const report = buildTrendReport(60_000);
    const output = formatTrendReport(report);
    expect(output).toContain('3000');
    expect(output).toContain('tcp');
  });
});
