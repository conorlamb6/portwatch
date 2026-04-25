/**
 * throttle.ts
 * Provides rate-limiting / throttle utilities for event dispatch and notifications.
 */

export interface ThrottleConfig {
  windowMs: number;   // time window in milliseconds
  maxEvents: number;  // max events allowed per window per key
}

interface ThrottleBucket {
  count: number;
  windowStart: number;
}

const DEFAULT_CONFIG: ThrottleConfig = {
  windowMs: 60_000,
  maxEvents: 5,
};

let config: ThrottleConfig = { ...DEFAULT_CONFIG };
const buckets = new Map<string, ThrottleBucket>();

export function configureThrottle(overrides: Partial<ThrottleConfig>): void {
  config = { ...DEFAULT_CONFIG, ...overrides };
}

export function resetThrottle(): void {
  config = { ...DEFAULT_CONFIG };
  buckets.clear();
}

export function isThrottled(key: string, now: number = Date.now()): boolean {
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= config.windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return false;
  }

  if (bucket.count >= config.maxEvents) {
    return true;
  }

  bucket.count += 1;
  return false;
}

export function getRemainingQuota(key: string, now: number = Date.now()): number {
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= config.windowMs) {
    return config.maxEvents;
  }
  return Math.max(0, config.maxEvents - bucket.count);
}

export function getThrottleConfig(): ThrottleConfig {
  return { ...config };
}
