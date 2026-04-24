import {
  resetReporter,
  recordEntry,
  buildReport,
  formatReport,
} from './reporter';
import { PortEvent } from './monitor';
import { AlertResult } from './alerts';

const mockOpenEvent: PortEvent = { type: 'opened', port: 3000, timestamp: Date.now() };
const mockCloseEvent: PortEvent = { type: 'closed', port: 8080, timestamp: Date.now() };
const triggeredAlert: AlertResult = { triggered: true, rule: 'port 3000 opened', message: 'Port 3000 opened' };
const silentAlert: AlertResult = { triggered: false, rule: 'port 9999', message: '' };

beforeEach(() => {
  resetReporter();
});

describe('recordEntry', () => {
  it('records an entry with event and alerts', () => {
    recordEntry(mockOpenEvent, [triggeredAlert]);
    const report = buildReport();
    expect(report.entries).toHaveLength(1);
    expect(report.entries[0].event).toEqual(mockOpenEvent);
    expect(report.entries[0].alerts).toContain(triggeredAlert);
  });
});

describe('buildReport', () => {
  it('returns empty summary when no entries', () => {
    const report = buildReport();
    expect(report.summary.totalEvents).toBe(0);
    expect(report.summary.openedPorts).toEqual([]);
    expect(report.summary.closedPorts).toEqual([]);
    expect(report.summary.alertsFired).toBe(0);
  });

  it('correctly counts opened and closed ports', () => {
    recordEntry(mockOpenEvent, []);
    recordEntry(mockCloseEvent, []);
    const report = buildReport();
    expect(report.summary.openedPorts).toContain(3000);
    expect(report.summary.closedPorts).toContain(8080);
    expect(report.summary.totalEvents).toBe(2);
  });

  it('counts only triggered alerts', () => {
    recordEntry(mockOpenEvent, [triggeredAlert, silentAlert]);
    const report = buildReport();
    expect(report.summary.alertsFired).toBe(1);
  });

  it('includes a generatedAt timestamp', () => {
    const report = buildReport();
    expect(report.generatedAt).toBeTruthy();
    expect(new Date(report.generatedAt).getTime()).not.toBeNaN();
  });
});

describe('formatReport', () => {
  it('includes summary headers', () => {
    const report = buildReport();
    const output = formatReport(report);
    expect(output).toContain('=== PortWatch Report ===');
    expect(output).toContain('Total events');
  });

  it('lists opened port in output', () => {
    recordEntry(mockOpenEvent, [triggeredAlert]);
    const report = buildReport();
    const output = formatReport(report);
    expect(output).toContain('3000');
    expect(output).toContain('OPENED');
  });
});
