import { getLifecycleEntries } from './portLifecycleCommand';
import {
  computeDurationStats,
  formatDurationReport,
  PortDurationStats,
} from './portDuration';

export interface DurationCommandOptions {
  protocol?: string;
  minSessions?: number;
  top?: number;
}

let _output: string = '';

export function resetDurationCommand(): void {
  _output = '';
}

export function getDurationOutput(): string {
  return _output;
}

export function filterDurationStats(
  stats: PortDurationStats[],
  opts: DurationCommandOptions
): PortDurationStats[] {
  let result = stats;

  if (opts.protocol) {
    const proto = opts.protocol.toLowerCase();
    result = result.filter((s) => s.protocol.toLowerCase() === proto);
  }

  if (opts.minSessions !== undefined && opts.minSessions > 0) {
    result = result.filter((s) => s.sessionCount >= opts.minSessions!);
  }

  if (opts.top !== undefined && opts.top > 0) {
    result = result.slice(0, opts.top);
  }

  return result;
}

export function runDurationCommand(opts: DurationCommandOptions = {}): string {
  const entries = getLifecycleEntries();
  const allStats = computeDurationStats(entries);
  const filtered = filterDurationStats(allStats, opts);
  _output = formatDurationReport(filtered);
  return _output;
}
