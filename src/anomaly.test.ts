import {
  configureAnomaly,
  resetAnomaly,
  detectNewPort,
  detectFrequencySpike,
  analyzeEntries,
  formatAnomalyResult,
} from './anomaly';
import { captureBaseline, resetBaseline } from './baseline';
import { resetHistory, recordHistoryEntry } from './history';

const mockEntry = { port: 9999, protocol: 'tcp', pid: 1234, process: 'test', state: 'LISTEN' };

beforeEach(() => {
  resetAnomaly();
  resetBaseline();
  resetHistory();
});

describe('detectNewPort', () => {
  it('returns null when no baseline is set', () => {
    expect(detectNewPort(mockEntry)).toBeNull();
  });

  it('returns anomaly when port is not in baseline', () => {
    captureBaseline([{ port: 80, protocol: 'tcp', pid: 1, process: 'nginx', state: 'LISTEN' }]);
    const result = detectNewPort(mockEntry);
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('high');
    expect(result?.port).toBe(9999);
  });

  it('returns null when port is in baseline', () => {
    captureBaseline([mockEntry]);
    expect(detectNewPort(mockEntry)).toBeNull();
  });
});

describe('detectFrequencySpike', () => {
  it('returns null when activity is below threshold', () => {
    recordHistoryEntry({ port: 8080, protocol: 'tcp', event: 'opened', timestamp: new Date().toISOString() });
    expect(detectFrequencySpike(8080)).toBeNull();
  });

  it('returns medium anomaly when threshold is reached', () => {
    configureAnomaly(2);
    for (let i = 0; i < 2; i++) {
      recordHistoryEntry({ port: 8080, protocol: 'tcp', event: 'opened', timestamp: new Date().toISOString() });
    }
    const result = detectFrequencySpike(8080);
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('medium');
  });

  it('returns high anomaly when double threshold is reached', () => {
    configureAnomaly(2);
    for (let i = 0; i < 4; i++) {
      recordHistoryEntry({ port: 8080, protocol: 'tcp', event: 'opened', timestamp: new Date().toISOString() });
    }
    const result = detectFrequencySpike(8080);
    expect(result?.severity).toBe('high');
  });
});

describe('analyzeEntries', () => {
  it('returns empty array when no anomalies', () => {
    captureBaseline([mockEntry]);
    expect(analyzeEntries([mockEntry])).toHaveLength(0);
  });

  it('detects anomalies across multiple entries', () => {
    captureBaseline([{ port: 80, protocol: 'tcp', pid: 1, process: 'nginx', state: 'LISTEN' }]);
    const results = analyzeEntries([mockEntry]);
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('formatAnomalyResult', () => {
  it('formats result with severity tag', () => {
    const result = { port: 9999, protocol: 'tcp', reason: 'test reason', severity: 'high' as const };
    const formatted = formatAnomalyResult(result);
    expect(formatted).toContain('[ANOMALY:HIGH]');
    expect(formatted).toContain('port=9999');
    expect(formatted).toContain('test reason');
  });
});
