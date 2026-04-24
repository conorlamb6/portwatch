import { initLogger, formatAlert, logAlert, closeLogger } from './logger';
import { Alert } from './alerts';

const mockAlert: Alert = {
  timestamp: new Date('2024-01-15T10:00:00.000Z'),
  severity: 'warning',
  event: { type: 'opened', port: 8080, process: 'node', pid: 42 },
  message: 'Port 8080 opened (node)',
};

beforeEach(() => {
  closeLogger();
});

describe('formatAlert', () => {
  it('formats as text by default', () => {
    initLogger({ format: 'text', silent: true });
    const result = formatAlert(mockAlert);
    expect(result).toContain('WARNING');
    expect(result).toContain('Port 8080 opened (node)');
    expect(result).toContain('2024-01-15T10:00:00.000Z');
  });

  it('formats as JSON when specified', () => {
    initLogger({ format: 'json', silent: true });
    const result = formatAlert(mockAlert);
    const parsed = JSON.parse(result);
    expect(parsed.severity).toBe('warning');
    expect(parsed.port).toBe(8080);
    expect(parsed.type).toBe('opened');
    expect(parsed.process).toBe('node');
    expect(parsed.pid).toBe(42);
  });

  it('includes null for missing process in JSON', () => {
    initLogger({ format: 'json', silent: true });
    const alertNoProc: Alert = { ...mockAlert, event: { type: 'closed', port: 3000 } };
    const parsed = JSON.parse(formatAlert(alertNoProc));
    expect(parsed.process).toBeNull();
    expect(parsed.pid).toBeNull();
  });
});

describe('logAlert', () => {
  it('logs to console when not silent', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    initLogger({ silent: false });
    logAlert(mockAlert);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('does not log to console when silent', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    initLogger({ silent: true });
    logAlert(mockAlert);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
