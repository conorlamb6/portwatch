import {
  configureNotifier,
  sendNotification,
  resetNotifier,
  NotificationPayload,
} from './notifier';

const makePayload = (overrides?: Partial<NotificationPayload>): NotificationPayload => ({
  level: 'info',
  message: 'port opened',
  port: 3000,
  timestamp: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

describe('notifier', () => {
  beforeEach(() => {
    resetNotifier();
  });

  it('sends notification via console channel by default', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const result = sendNotification(makePayload());
    expect(result).toBe(true);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('port=3000'));
    spy.mockRestore();
  });

  it('invokes callback channel when configured', () => {
    const cb = jest.fn();
    configureNotifier({ channels: ['callback'], onNotify: cb });
    sendNotification(makePayload({ level: 'warn', port: 8080 }));
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ port: 8080, level: 'warn' }));
  });

  it('throttles duplicate port+level notifications', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    configureNotifier({ channels: ['console'], throttleMs: 5000 });
    const first = sendNotification(makePayload());
    const second = sendNotification(makePayload());
    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('allows different port+level combos independently', () => {
    configureNotifier({ channels: ['console'], throttleMs: 5000 });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    sendNotification(makePayload({ port: 3000, level: 'info' }));
    sendNotification(makePayload({ port: 4000, level: 'info' }));
    sendNotification(makePayload({ port: 3000, level: 'critical' }));
    expect(spy).toHaveBeenCalledTimes(3);
    spy.mockRestore();
  });

  it('prefixes critical messages with [CRITICAL]', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    sendNotification(makePayload({ level: 'critical' }));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[CRITICAL]'));
    spy.mockRestore();
  });

  it('resets state cleanly', () => {
    const cb = jest.fn();
    configureNotifier({ channels: ['callback'], onNotify: cb, throttleMs: 9999 });
    sendNotification(makePayload());
    resetNotifier();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const result = sendNotification(makePayload());
    expect(result).toBe(true);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('includes timestamp in console output', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    sendNotification(makePayload({ timestamp: new Date('2024-06-15T12:30:00Z') }));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('2024-06-15'));
    spy.mockRestore();
  });
});
