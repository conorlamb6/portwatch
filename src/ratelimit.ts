/**
 * ratelimit.ts
 * Higher-level rate-limit facade used by dispatch and notifier.
 * Wraps throttle with per-port and per-alert-level key generation.
 */

import { isThrottled, getRemainingQuota, configureThrottle, resetThrottle } from './throttle';

export type AlertLevel = 'info' | 'warn' | 'critical';

export interface RateLimitConfig {
  windowMs?: number;
  maxEventsPerPort?: number;
}

export function configureRateLimit(cfg: RateLimitConfig): void {
  configureThrottle({
    windowMs: cfg.windowMs ?? 60_000,
    maxEvents: cfg.maxEventsPerPort ?? 5,
  });
}

export function resetRateLimit(): void {
  resetThrottle();
}

export function buildKey(port: number, level: AlertLevel): string {
  return `${level}:${port}`;
}

export function checkRateLimit(port: number, level: AlertLevel, now?: number): boolean {
  const key = buildKey(port, level);
  return isThrottled(key, now);
}

export function quotaForPort(port: number, level: AlertLevel, now?: number): number {
  const key = buildKey(port, level);
  return getRemainingQuota(key, now);
}
