import {
  configureAlerts,
  evaluateEvent,
  evaluateEvents,
  resetAlerts,
  Alert,
} from './alerts';
import { PortEvent } from './monitor';

const openEvent: PortEvent = {
  type: 'opened',
  port: 8080,
  process: 'node',
  pid: 1234,
};

const closeEvent: PortEvent = {
  type: 'closed',
  port: 3000,
  process: 'python',
  pid: 5678,
};

beforeEach(() => {
  resetAlerts();
});

describe('evaluateEvent', () => {
  it('returns null when no rules are configured', () => {
    expect(evaluateEvent(openEvent)).toBeNull();
  });

  it('matches a rule with no port filter', () => {
    configureAlerts({ rules: [{ severity: 'info' }] });
    const alert = evaluateEvent(openEvent);
    expect(alert).not.toBeNull();
    expect(alert?.severity).toBe('info');
  });

  it('matches a rule targeting a specific port', () => {
    configureAlerts({ rules: [{ ports: [8080], severity: 'critical' }] });
    const alert = evaluateEvent(openEvent);
    expect(alert?.severity).toBe('critical');
  });

  it('does not match when port is not in rule ports', () => {
    configureAlerts({ rules: [{ ports: [9999], severity: 'warning' }] });
    expect(evaluateEvent(openEvent)).toBeNull();
  });

  it('uses custom message when provided', () => {
    configureAlerts({ rules: [{ severity: 'info', message: 'Custom alert!' }] });
    const alert = evaluateEvent(openEvent);
    expect(alert?.message).toBe('Custom alert!');
  });

  it('calls onAlert callback when rule matches', () => {
    const cb = jest.fn();
    configureAlerts({ rules: [{ severity: 'warning' }], onAlert: cb });
    evaluateEvent(closeEvent);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});

describe('evaluateEvents', () => {
  it('returns alerts for all matching events', () => {
    configureAlerts({ rules: [{ severity: 'info' }] });
    const alerts: Alert[] = evaluateEvents([openEvent, closeEvent]);
    expect(alerts).toHaveLength(2);
  });

  it('returns empty array when no events match', () => {
    configureAlerts({ rules: [{ ports: [9999], severity: 'critical' }] });
    expect(evaluateEvents([openEvent, closeEvent])).toHaveLength(0);
  });
});
