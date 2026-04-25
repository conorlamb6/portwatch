import {
  configureRateLimit,
  resetRateLimit,
  buildKey,
  checkRateLimit,
  quotaForPort,
} from './ratelimit';

describe('ratelimit', () => {
  beforeEach(() => resetRateLimit());

  describe('buildKey', () => {
    it('formats key as level:port', () => {
      expect(buildKey(8080, 'warn')).toBe('warn:8080');
      expect(buildKey(443, 'critical')).toBe('critical:443');
    });
  });

  describe('configureRateLimit', () => {
    it('applies defaults when no options given', () => {
      expect(() => configureRateLimit({})).not.toThrow();
    });

    it('accepts custom windowMs and maxEventsPerPort', () => {
      expect(() =>
        configureRateLimit({ windowMs: 30_000, maxEventsPerPort: 2 })
      ).not.toThrow();
    });
  });

  describe('checkRateLimit', () => {
    it('returns false for first event', () => {
      expect(checkRateLimit(3000, 'info', 1000)).toBe(false);
    });

    it('throttles after configured max', () => {
      configureRateLimit({ windowMs: 10_000, maxEventsPerPort: 2 });
      checkRateLimit(80, 'warn', 1000);
      checkRateLimit(80, 'warn', 2000);
      expect(checkRateLimit(80, 'warn', 3000)).toBe(true);
    });

    it('does not bleed between ports', () => {
      configureRateLimit({ windowMs: 10_000, maxEventsPerPort: 1 });
      checkRateLimit(80, 'info', 1000);
      expect(checkRateLimit(443, 'info', 1000)).toBe(false);
    });

    it('does not bleed between alert levels', () => {
      configureRateLimit({ windowMs: 10_000, maxEventsPerPort: 1 });
      checkRateLimit(80, 'info', 1000);
      expect(checkRateLimit(80, 'warn', 1000)).toBe(false);
    });

    it('resets after window expires', () => {
      configureRateLimit({ windowMs: 5_000, maxEventsPerPort: 1 });
      checkRateLimit(80, 'critical', 1000);
      expect(checkRateLimit(80, 'critical', 7000)).toBe(false);
    });
  });

  describe('quotaForPort', () => {
    it('returns full quota initially', () => {
      configureRateLimit({ maxEventsPerPort: 3 });
      expect(quotaForPort(8080, 'info', 1000)).toBe(3);
    });

    it('decrements quota after events', () => {
      configureRateLimit({ windowMs: 10_000, maxEventsPerPort: 3 });
      checkRateLimit(8080, 'info', 1000);
      expect(quotaForPort(8080, 'info', 2000)).toBe(2);
    });

    it('returns 0 when fully throttled', () => {
      configureRateLimit({ windowMs: 10_000, maxEventsPerPort: 1 });
      checkRateLimit(8080, 'warn', 1000);
      expect(quotaForPort(8080, 'warn', 2000)).toBe(0);
    });
  });
});
