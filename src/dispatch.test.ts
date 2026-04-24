import { configureDispatch, dispatchEvent, dispatchEvents, resetDispatch } from './dispatch';
import * as logger from './logger';
import * as reporter from './reporter';
import * as notifier from './notifier';
import { AlertEvent } from './alerts';

const makeEvent = (overrides?: Partial<AlertEvent>): AlertEvent => ({
  type: 'opened',
  port: 3000,
  pid: 1234,
  processName: 'node',
  severity: 'info',
  timestamp: new Date('2024-06-01T12:00:00Z'),
  ...overrides,
});

describe('dispatch', () => {
  let logSpy: jest.SpyInstance;
  let recordSpy: jest.SpyInstance;
  let notifySpy: jest.SpyInstance;

  beforeEach(() => {
    resetDispatch();
    logSpy = jest.spyOn(logger, 'logAlert').mockImplementation(() => {});
    recordSpy = jest.spyOn(reporter, 'recordEntry').mockImplementation(() => {});
    notifySpy = jest.spyOn(notifier, 'sendNotification').mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls log, record, and notify by default', () => {
    dispatchEvent(makeEvent());
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(recordSpy).toHaveBeenCalledTimes(1);
    expect(notifySpy).toHaveBeenCalledTimes(1);
  });

  it('skips logging when log is false', () => {
    configureDispatch({ log: false });
    dispatchEvent(makeEvent());
    expect(logSpy).not.toHaveBeenCalled();
    expect(recordSpy).toHaveBeenCalled();
  });

  it('skips notification when notify is false', () => {
    configureDispatch({ notify: false });
    dispatchEvent(makeEvent());
    expect(notifySpy).not.toHaveBeenCalled();
  });

  it('maps severity=critical to level=critical', () => {
    dispatchEvent(makeEvent({ severity: 'critical' }));
    expect(notifySpy).toHaveBeenCalledWith(expect.objectContaining({ level: 'critical' }));
  });

  it('maps severity=warning to level=warn', () => {
    dispatchEvent(makeEvent({ severity: 'warning' }));
    expect(notifySpy).toHaveBeenCalledWith(expect.objectContaining({ level: 'warn' }));
  });

  it('records closed state for closed events', () => {
    dispatchEvent(makeEvent({ type: 'closed' }));
    expect(recordSpy).toHaveBeenCalledWith(expect.objectContaining({ state: 'closed' }));
  });

  it('dispatches multiple events', () => {
    dispatchEvents([makeEvent({ port: 3000 }), makeEvent({ port: 4000 })]);
    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(notifySpy).toHaveBeenCalledTimes(2);
  });

  it('resets to default options', () => {
    configureDispatch({ log: false, notify: false, record: false });
    resetDispatch();
    dispatchEvent(makeEvent());
    expect(logSpy).toHaveBeenCalled();
    expect(notifySpy).toHaveBeenCalled();
  });
});
