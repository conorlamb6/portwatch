import {
  configureThrottle,
  resetThrottle,
  isThrottled,
  getRemainingQuota,
  getThrottleConfig,
} from './throttle';

describe('throttle', () => {
  beforeEach(() => resetThrottle());

  describe('configureThrottle', () => {
    it('applies partial overrides', () => {
      configureThrottle({ maxEvents: 2 });
      expect(getThrottleConfig()).toMatchObject({ maxEvents: 2, windowMs: 60_000 });
    });
  });

  describe('isThrottled', () => {
    it('allows first event for a new key', () => {
      expect(isThrottled('port:8080', 1000)).toBe(false);
    });

    it('allows events up to maxEvents within window', () => {
      configureThrottle({ windowMs: 10_000, maxEvents: 3 });
      expect(isThrottled('k', 1000)).toBe(false);
      expect(isThrottled('k', 2000)).toBe(false);
      expect(isThrottled('k', 3000)).toBe(false);
    });

    it('throttles after maxEvents within window', () => {
      configureThrottle({ windowMs: 10_000, maxEvents: 3 });
      isThrottled('k', 1000);
      isThrottled('k', 2000);
      isThrottled('k', 3000);
      expect(isThrottled('k', 4000)).toBe(true);
    });

    it('resets bucket after window expires', () => {
      configureThrottle({ windowMs: 5_000, maxEvents: 1 });
      isThrottled('k', 1000);
      expect(isThrottled('k', 2000)).toBe(true);
      expect(isThrottled('k', 7000)).toBe(false); // new window
    });

    it('tracks different keys independently', () => {
      configureThrottle({ windowMs: 10_000, maxEvents: 1 });
      isThrottled('a', 1000);
      expect(isThrottled('a', 2000)).toBe(true);
      expect(isThrottled('b', 2000)).toBe(false);
    });
  });

  describe('getRemainingQuota', () => {
    it('returns full quota for unknown key', () => {
      configureThrottle({ maxEvents: 4 });
      expect(getRemainingQuota('new', 1000)).toBe(4);
    });

    it('decrements after events', () => {
      configureThrottle({ windowMs: 10_000, maxEvents: 3 });
      isThrottled('k', 1000);
      isThrottled('k', 2000);
      expect(getRemainingQuota('k', 3000)).toBe(1);
    });

    it('returns 0 when exhausted', () => {
      configureThrottle({ windowMs: 10_000, maxEvents: 2 });
      isThrottled('k', 1000);
      isThrottled('k', 2000);
      expect(getRemainingQuota('k', 3000)).toBe(0);
    });
  });

  describe('resetThrottle', () => {
    it('clears all buckets and restores defaults', () => {
      configureThrottle({ maxEvents: 1 });
      isThrottled('k', 1000);
      resetThrottle();
      expect(getThrottleConfig().maxEvents).toBe(5);
      expect(isThrottled('k', 1000)).toBe(false);
    });
  });
});
