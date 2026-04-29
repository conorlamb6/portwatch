import {
  formatScoreLine,
  formatScoreReport,
  runPortScoreCommand,
} from './portScoreCommand';
import { resetHistory, recordHistoryEntry } from './history';
import { configureWatchlist, resetWatchlist } from './watchlist';
import { resetScoreWeights } from './portScore';

beforeEach(() => {
  resetHistory();
  resetWatchlist();
  resetScoreWeights();
});

describe('formatScoreLine', () => {
  it('formats a low-level score line', () => {
    const line = formatScoreLine({
      port: 3000,
      protocol: 'tcp',
      score: 10,
      level: 'low',
      reasons: ['non-well-known port'],
    });
    expect(line).toContain('[LOW]');
    expect(line).toContain('3000/tcp');
    expect(line).toContain('score=10');
    expect(line).toContain('non-well-known port');
  });

  it('formats a critical-level score line', () => {
    const line = formatScoreLine({
      port: 4444,
      protocol: 'tcp',
      score: 90,
      level: 'critical',
      reasons: ['watchlisted', '2 anomaly event(s)'],
    });
    expect(line).toContain('[CRITICAL]');
    expect(line).toContain('score=90');
  });
});

describe('formatScoreReport', () => {
  it('returns empty message when no scores', () => {
    expect(formatScoreReport([])).toBe('No port score data available.');
  });

  it('includes header and score lines', () => {
    const report = formatScoreReport([
      { port: 8080, protocol: 'tcp', score: 25, level: 'medium', reasons: ['newly observed port'] },
    ]);
    expect(report).toContain('Port Risk Scores');
    expect(report).toContain('8080/tcp');
  });
});

describe('runPortScoreCommand', () => {
  it('returns empty message when no history', () => {
    const output = runPortScoreCommand();
    expect(output).toBe('No port score data available.');
  });

  it('includes scored ports from history', () => {
    recordHistoryEntry({ port: 9999, protocol: 'tcp', event: 'open', timestamp: Date.now(), isNew: true, anomaly: false });
    const output = runPortScoreCommand();
    expect(output).toContain('9999/tcp');
  });

  it('filters to high/critical with --high flag', () => {
    configureWatchlist({ ports: [4444] });
    recordHistoryEntry({ port: 4444, protocol: 'tcp', event: 'open', timestamp: Date.now(), isNew: true, anomaly: true });
    recordHistoryEntry({ port: 80, protocol: 'tcp', event: 'open', timestamp: Date.now(), isNew: false, anomaly: false });
    const output = runPortScoreCommand(['--high']);
    expect(output).toContain('4444/tcp');
    expect(output).not.toContain('80/tcp');
  });

  it('shows all ports without --high flag', () => {
    recordHistoryEntry({ port: 3000, protocol: 'tcp', event: 'open', timestamp: Date.now(), isNew: false, anomaly: false });
    const output = runPortScoreCommand();
    expect(output).toContain('3000/tcp');
  });
});
