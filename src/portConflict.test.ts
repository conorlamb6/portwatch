import {
  resetConflicts,
  configureExpectedProcesses,
  detectMultiProcessConflicts,
  detectUnexpectedProcessConflicts,
  analyzeConflicts,
  formatConflictReport,
} from './portConflict';
import { PortEntry } from './scanner';

function makeEntry(port: number, protocol: string, process?: string, pid?: number): PortEntry {
  return { port, protocol, state: 'LISTEN', address: '0.0.0.0', process, pid };
}

beforeEach(() => {
  resetConflicts();
});

describe('detectMultiProcessConflicts', () => {
  it('returns empty array when no duplicates', () => {
    const entries = [makeEntry(80, 'tcp', 'nginx', 100), makeEntry(443, 'tcp', 'nginx', 101)];
    expect(detectMultiProcessConflicts(entries)).toHaveLength(0);
  });

  it('detects two processes on the same port/protocol', () => {
    const entries = [
      makeEntry(8080, 'tcp', 'node', 200),
      makeEntry(8080, 'tcp', 'python', 201),
    ];
    const result = detectMultiProcessConflicts(entries);
    expect(result).toHaveLength(1);
    expect(result[0].port).toBe(8080);
    expect(result[0].reason).toBe('multi-process');
    expect(result[0].processes).toContain('node');
    expect(result[0].processes).toContain('python');
  });

  it('does not flag same port on different protocols', () => {
    const entries = [makeEntry(53, 'tcp', 'named', 300), makeEntry(53, 'udp', 'named', 300)];
    expect(detectMultiProcessConflicts(entries)).toHaveLength(0);
  });
});

describe('detectUnexpectedProcessConflicts', () => {
  it('returns empty when no expected processes configured', () => {
    const entries = [makeEntry(80, 'tcp', 'apache', 400)];
    expect(detectUnexpectedProcessConflicts(entries)).toHaveLength(0);
  });

  it('flags process not matching expected', () => {
    configureExpectedProcesses({ 80: 'nginx' });
    const entries = [makeEntry(80, 'tcp', 'apache', 400)];
    const result = detectUnexpectedProcessConflicts(entries);
    expect(result).toHaveLength(1);
    expect(result[0].reason).toBe('unexpected-process');
    expect(result[0].port).toBe(80);
  });

  it('does not flag matching expected process', () => {
    configureExpectedProcesses({ 80: 'nginx' });
    const entries = [makeEntry(80, 'tcp', 'nginx', 400)];
    expect(detectUnexpectedProcessConflicts(entries)).toHaveLength(0);
  });
});

describe('analyzeConflicts', () => {
  it('combines multi-process and unexpected-process results', () => {
    configureExpectedProcesses({ 443: 'nginx' });
    const entries = [
      makeEntry(8080, 'tcp', 'node', 1),
      makeEntry(8080, 'tcp', 'ruby', 2),
      makeEntry(443, 'tcp', 'apache', 3),
    ];
    const result = analyzeConflicts(entries);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});

describe('formatConflictReport', () => {
  it('returns no-conflict message for empty array', () => {
    expect(formatConflictReport([])).toBe('No port conflicts detected.');
  });

  it('includes port and reason in output', () => {
    const conflicts = [{ port: 8080, protocol: 'tcp', pids: [1, 2], processes: ['node', 'ruby'], reason: 'multi-process' as const }];
    const report = formatConflictReport(conflicts);
    expect(report).toContain('8080');
    expect(report).toContain('multi-process');
    expect(report).toContain('node');
  });
});
