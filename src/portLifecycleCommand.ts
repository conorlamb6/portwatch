/**
 * portLifecycleCommand.ts
 * CLI command handler for displaying port lifecycle information.
 */

import {
  getOpenPorts,
  getClosedPorts,
  formatLifecycleEntry,
  PortLifecycleEntry,
} from './portLifecycle';

export type LifecycleFilter = 'all' | 'open' | 'closed';

export interface LifecycleCommandOptions {
  filter?: LifecycleFilter;
  sortByDuration?: boolean;
}

export function getLifecycleEntries(filter: LifecycleFilter = 'all'): PortLifecycleEntry[] {
  if (filter === 'open') return getOpenPorts();
  if (filter === 'closed') return getClosedPorts();
  return [...getOpenPorts(), ...getClosedPorts()];
}

export function sortByDuration(entries: PortLifecycleEntry[]): PortLifecycleEntry[] {
  return [...entries].sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0));
}

export function formatLifecycleReport(entries: PortLifecycleEntry[]): string {
  if (entries.length === 0) return 'No lifecycle data available.';
  return entries.map(formatLifecycleEntry).join('\n');
}

export function runLifecycleCommand(options: LifecycleCommandOptions = {}): string {
  const { filter = 'all', sortByDuration: doSort = false } = options;
  let entries = getLifecycleEntries(filter);
  if (doSort) entries = sortByDuration(entries);
  return formatLifecycleReport(entries);
}
